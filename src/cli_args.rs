use clap::{Parser, Subcommand};

#[derive(Parser, Debug, Clone)]
#[clap(name = "eye")]
pub struct Opt {
  #[clap(subcommand)]
  pub command: Commands,
}

#[derive(Debug, Subcommand, Clone)]
pub enum Commands {
  /// Start server
  Serve {
    /// Port to listen to
    #[clap(short, long, env = "PORT", default_value = "3000")]
    port: u16,

    /// host
    #[clap(long, env = "HOST", default_value = "localhost")]
    host: String,

    /// JWT secret
    #[clap(long, env = "JWT_SECRET")]
    jwt_secret: String,

    /// Database URL
    #[clap(long, env = "DATABASE_URL")]
    database_url: String,
  },

  /// Run picture extraction process
  ExtractPictures {},
}
