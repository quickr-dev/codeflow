mod api;
mod config;
mod scanner;

use anyhow::Result;
use clap::{CommandFactory, Parser, Subcommand};
use open;
use std::env;
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    // @codeflow(cli->init#1)
    #[clap(about = "Create a .codeflow.json file")]
    Init {
        #[arg(short, long, value_name = "DIR")]
        dir: Option<PathBuf>,
    },

    // @codeflow(cli->push#1)
    #[clap(about = "Send annotations to server")]
    Push {
        #[arg(short, long, value_name = "DIR")]
        dir: Option<PathBuf>,
    },

    #[clap(about = "Open codeflow in the browser")]
    Open {
        #[arg(short, long, value_name = "DIR")]
        dir: Option<PathBuf>,
    },
}

fn main() -> Result<()> {
    let args = Cli::parse();

    match args.command {
        // @codeflow(cli->init#2)
        Some(Commands::Init { dir }) => {
            let dir = dir.unwrap_or_else(|| env::current_dir().unwrap());
            let _ = config::create_config(&dir);

            Ok(())
        }

        // @codeflow(cli->push#2)
        Some(Commands::Push { dir }) => {
            let dir = dir.unwrap_or_else(|| env::current_dir().unwrap());
            let files = scanner::scan_directory(&dir)?;
            let config = config::read_config(&dir)?;
            let _ = api::send_to_api(files, &config);

            Ok(())
        }
        Some(Commands::Open { dir }) => {
            let dir = dir.unwrap_or_else(|| env::current_dir().unwrap());
            let config = config::read_config(&dir)?;

            let url = format!(
                "https://dev-codeflow.vercel.app/projects/{}",
                config.project
            );

            if let Err(e) = open::that(&url) {
                eprintln!("Failed to open URL: {}", e);
            } else {
                println!("Opening project in browser: {}", url);
            }

            Ok(())
        }

        None => {
            Cli::command().print_help()?;
            Ok(())
        }
    }
}
