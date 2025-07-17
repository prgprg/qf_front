#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod qf_funding {
    use ink::prelude::vec::Vec;
    use ink::prelude::string::String;

    #[derive(scale::Encode, scale::Decode, Clone, Debug, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Contribution {
        pub amount: Balance,
        pub contributor: AccountId,
        pub project_id: u32,
        pub round_id: u32,
        pub timestamp: Timestamp,
    }

    #[derive(scale::Encode, scale::Decode, Clone, Debug, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Project {
        pub project_id: u32,
        pub total_contributions: Balance,
        pub contributor_count: u32,
    }

    #[derive(scale::Encode, scale::Decode, Clone, Debug, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct Round {
        pub round_id: u32,
        pub matching_pool: Balance,
        pub eligible_projects: Vec<u32>,
        pub start_time: Timestamp,
        pub end_time: Timestamp,
        pub active: bool,
        pub final_alpha: Option<u32>, // Fixed-point: 10000 = 1.0
        pub is_finalized: bool,
    }

    #[derive(scale::Encode, scale::Decode, Clone, Debug, PartialEq, Eq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout))]
    pub struct RoundData {
        pub round_info: Round,
        pub projects: Vec<Project>,
        pub contributions: Vec<Contribution>,
    }

    #[ink(storage)]
    pub struct QfSystem {
        admin: AccountId,
        projects: ink::storage::Mapping<u32, Project>,
        rounds: ink::storage::Mapping<u32, Round>,
        contributions: Vec<Contribution>,
        next_project_id: u32,
        next_round_id: u32,
        min_contribution: Balance, // Minimum contribution amount (1€ equivalent)
    }

    impl QfSystem {
        /// Constructor to create a new QF System
        #[ink(constructor)]
        pub fn new(min_contribution: Balance) -> Self {
            let caller = Self::env().caller();
            let mut account_bytes = [0u8; 32];
            account_bytes[..20].copy_from_slice(&caller.0);
            
            Self {
                admin: AccountId::from(account_bytes),
                projects: ink::storage::Mapping::default(),
                rounds: ink::storage::Mapping::default(),
                contributions: Vec::new(),
                next_project_id: 1,
                next_round_id: 1,
                min_contribution,
            }
        }

        /// Admin function to add a new project
        #[ink(message)]
        pub fn add_project(&mut self) -> Result<u32, String> {
            let caller = Self::env().caller();
            let mut account_bytes = [0u8; 32];
            account_bytes[..20].copy_from_slice(&caller.0);
            let caller_account = AccountId::from(account_bytes);
            
            if caller_account != self.admin {
                return Err("Only admin can add projects".into());
            }

            let project_id = self.next_project_id;
            let project = Project {
                project_id,
                total_contributions: 0,
                contributor_count: 0,
            };
            
            self.projects.insert(project_id, &project);
            self.next_project_id += 1;
            
            Ok(project_id)
        }

        /// Admin function to create a new round
        #[ink(message)]
        pub fn create_round(
            &mut self,
            matching_pool: Balance,
            eligible_projects: Vec<u32>,
            duration_hours: u64,
        ) -> Result<u32, String> {
            let caller = Self::env().caller();
            let mut account_bytes = [0u8; 32];
            account_bytes[..20].copy_from_slice(&caller.0);
            let caller_account = AccountId::from(account_bytes);
            
            if caller_account != self.admin {
                return Err("Only admin can create rounds".into());
            }

            // Verify all projects exist
            for project_id in &eligible_projects {
                if !self.projects.contains(project_id) {
                    return Err("Project does not exist".into());
                }
            }

            let round_id = self.next_round_id;
            let start_time = Self::env().block_timestamp();
            let end_time = start_time + (duration_hours * 3600 * 1000); // Convert to milliseconds

            let round = Round {
                round_id,
                matching_pool,
                eligible_projects,
                start_time,
                end_time,
                active: true,
                final_alpha: None,
                is_finalized: false,
            };

            self.rounds.insert(round_id, &round);
            self.next_round_id += 1;

            Ok(round_id)
        }

        /// User function to contribute to a project in a round
        #[ink(message)]
        pub fn contribute(&mut self, round_id: u32, project_id: u32, amount: Balance) -> Result<(), String> {
            // Check minimum contribution
            if amount < self.min_contribution {
                return Err("Contribution below minimum amount".into());
            }

            // Check if round exists and is active
            let round = self.rounds.get(round_id).ok_or("Round does not exist")?;
            if !round.active {
                return Err("Round is not active".into());
            }

            // Check if round is still within time bounds
            let current_time = Self::env().block_timestamp();
            if current_time < round.start_time || current_time > round.end_time {
                return Err("Round is not within active time period".into());
            }

            // Check if project is eligible for this round
            if !round.eligible_projects.contains(&project_id) {
                return Err("Project is not eligible for this round".into());
            }

            // Get contributor address
            let caller = Self::env().caller();
            let mut account_bytes = [0u8; 32];
            account_bytes[..20].copy_from_slice(&caller.0);
            let contributor = AccountId::from(account_bytes);

            // Create contribution record
            let contribution = Contribution {
                amount,
                contributor,
                project_id,
                round_id,
                timestamp: current_time,
            };

            // Update project stats
            let mut project = self.projects.get(project_id).ok_or("Project does not exist")?;
            
            // Check if this is a new contributor for this project
            let is_new_contributor = !self.contributions
                .iter()
                .any(|c| c.contributor == contributor && c.project_id == project_id);
            
            if is_new_contributor {
                project.contributor_count += 1;
            }
            
            project.total_contributions += amount;
            
            // Store updates
            self.contributions.push(contribution);
            self.projects.insert(project_id, &project);

            Ok(())
        }

        /// Get all data for a specific round (for frontend calculations)
        #[ink(message)]
        pub fn get_round_data(&self, round_id: u32) -> Result<RoundData, String> {
            let round = self.rounds.get(round_id).ok_or("Round does not exist")?;
            
            // Get all projects in this round
            let mut projects = Vec::new();
            for project_id in &round.eligible_projects {
                if let Some(project) = self.projects.get(project_id) {
                    projects.push(project);
                }
            }

            // Get all contributions for this round
            let contributions: Vec<Contribution> = self.contributions
                .iter()
                .filter(|c| c.round_id == round_id)
                .cloned()
                .collect();

            Ok(RoundData {
                round_info: round,
                projects,
                contributions,
            })
        }

        /// Get user statistics
        #[ink(message)]
        pub fn get_user_stats(&self, user: AccountId) -> (Balance, u32, Vec<u32>) {
            let mut total_contributed = 0;
            let mut projects_supported = Vec::new();
            let mut rounds_participated = Vec::new();

            for contribution in &self.contributions {
                if contribution.contributor == user {
                    total_contributed += contribution.amount;
                    
                    if !projects_supported.contains(&contribution.project_id) {
                        projects_supported.push(contribution.project_id);
                    }
                    
                    if !rounds_participated.contains(&contribution.round_id) {
                        rounds_participated.push(contribution.round_id);
                    }
                }
            }

            (total_contributed, projects_supported.len() as u32, rounds_participated)
        }

        /// Admin function to finalize a round and calculate alpha
        #[ink(message)]
        pub fn finalize_round(&mut self, round_id: u32) -> Result<u32, String> {
            let caller = Self::env().caller();
            let mut account_bytes = [0u8; 32];
            account_bytes[..20].copy_from_slice(&caller.0);
            let caller_account = AccountId::from(account_bytes);
            
            if caller_account != self.admin {
                return Err("Only admin can finalize rounds".into());
            }

            let mut round = self.rounds.get(round_id).ok_or("Round does not exist")?;
            if round.is_finalized {
                return Err("Round already finalized".into());
            }

            // Calculate ideal matches for all projects in the round
            let mut total_ideal_match = 0u128;
            
            for project_id in &round.eligible_projects {
                let project_contributions: Vec<&Contribution> = self.contributions
                    .iter()
                    .filter(|c| c.round_id == round_id && c.project_id == *project_id)
                    .collect();

                // Calculate ideal match using standard QF formula
                let sum_sqrt: u128 = project_contributions
                    .iter()
                    .map(|c| self.sqrt_u128(c.amount as u128))
                    .sum();
                
                let sum_contributions: u128 = project_contributions
                    .iter()
                    .map(|c| c.amount as u128)
                    .sum();

                let ideal_match = (sum_sqrt * sum_sqrt) - sum_contributions;
                total_ideal_match += ideal_match;
            }

            // Calculate alpha (scaling factor)
            let alpha = if total_ideal_match <= round.matching_pool as u128 {
                10000 // α = 1.0 (full funding)
            } else {
                // α = matching_pool / total_ideal_match, scaled by 10000
                ((round.matching_pool as u128 * 10000) / total_ideal_match) as u32
            };

            // Update round
            round.final_alpha = Some(alpha);
            round.is_finalized = true;
            round.active = false;
            self.rounds.insert(round_id, &round);

            Ok(alpha)
        }

        /// Get list of all active rounds
        #[ink(message)]
        pub fn get_active_rounds(&self) -> Vec<u32> {
            let mut active_rounds = Vec::new();
            let current_time = Self::env().block_timestamp();
            
            for i in 1..self.next_round_id {
                if let Some(round) = self.rounds.get(i) {
                    if round.active && current_time >= round.start_time && current_time <= round.end_time {
                        active_rounds.push(i);
                    }
                }
            }
            
            active_rounds
        }

        /// Helper function to calculate square root for QF calculations
        fn sqrt_u128(&self, x: u128) -> u128 {
            if x == 0 {
                return 0;
            }
            
            let mut result = x;
            let mut temp = (x + 1) / 2;
            
            while temp < result {
                result = temp;
                temp = (x / temp + temp) / 2;
            }
            
            result
        }

    }

    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the constructor works.
        #[ink::test]
        fn constructor_works() {
            let qf_system = QfSystem::new(1000); // 1000 as minimum contribution
            assert_eq!(qf_system.next_project_id, 1);
            assert_eq!(qf_system.next_round_id, 1);
        }

        /// Test adding projects
        #[ink::test]
        fn add_project_works() {
            let mut qf_system = QfSystem::new(1000);
            let project_id = qf_system.add_project().unwrap();
            assert_eq!(project_id, 1);
            assert_eq!(qf_system.next_project_id, 2);
        }
    }


    /// This is how you'd write end-to-end (E2E) or integration tests for ink! contracts.
    ///
    /// When running these you need to make sure that you:
    /// - Compile the tests with the `e2e-tests` feature flag enabled (`--features e2e-tests`)
    /// - Are running a Substrate node which contains `pallet-contracts` in the background
    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// A helper function used for calling contract messages.
        use ink_e2e::ContractsBackend;

        /// The End-to-End test `Result` type.
        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        /// We test that we can upload and instantiate the contract using its constructor.
        #[ink_e2e::test]
        async fn constructor_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            // Given
            let mut constructor = QfSystemRef::new(1000);

            // When
            let contract = client
                .instantiate("qf_funding", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let call_builder = contract.call_builder::<QfSystem>();

            // Then
            let add_project = call_builder.add_project();
            let project_result = client.call(&ink_e2e::alice(), &add_project).submit().await?;
            assert!(project_result.return_value().is_ok());

            Ok(())
        }
    }
}
