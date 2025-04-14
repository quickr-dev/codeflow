mod api;
mod config;
mod scanner;
mod validator;

use anyhow::Result;
use clap::{Parser, Subcommand};
use std::env;
use std::path::PathBuf;

/// CLI tool that extracts @codeflow annotations from project files and sends them to a server
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    Login,

    Update {
        #[arg(short, long, value_name = "DIR")]
        dir: Option<PathBuf>,
    },
}

fn main() -> Result<()> {
    let args = Args::parse();

    match args.command {
        Some(Commands::Login) => {
            panic!("unimplemented")
        }

        Some(Commands::Update { dir }) => {
            let path = dir.unwrap_or_else(|| env::current_dir().unwrap());
            let (annotations, files) = scanner::scan_directory(&path)?;
            let api_key = config::read_config()?.api_key;
            let _ = api::send_to_api(annotations, files, &api_key);

            Ok(())
        }

        None => Ok(()),
    }
}
