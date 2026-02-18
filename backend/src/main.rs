use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer};
use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize)]
struct Message {
    message: String,
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(Message {
        message: "Backend is running!".to_string(),
    })
}

async fn hello(name: web::Path<String>) -> HttpResponse {
    HttpResponse::Ok().json(Message {
        message: format!("Hello, {}!", name.into_inner()),
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    println!("Starting server on http://127.0.0.1:3001");

    HttpServer::new(|| {
        App::new()
            .wrap(Logger::default())
            .wrap(actix_cors::Cors::permissive())
            .service(
                web::scope("/api")
                    .route("/health", web::get().to(health))
                    .route("/hello/{name}", web::get().to(hello)),
            )
    })
    .bind("127.0.0.1:3001")?
    .run()
    .await
}
