#![allow(unused)]

use async_std::task;
use sqlx::sqlite::SqliteQueryResult;
use sqlx::types::time::Date;
use sqlx::{migrate::MigrateDatabase, FromRow, Pool, Sqlite, SqlitePool};

#[derive(FromRow, Debug)]
pub struct Employee {
    id: i32,
    name: String,
    birth_date: Date,
}

pub async fn connect() -> Result<Pool<Sqlite>, sqlx::Error> {
    const DB_URL: &str = "sqlite://db.sqlite";
    if !Sqlite::database_exists(DB_URL).await.unwrap_or(false) {
        match Sqlite::create_database(DB_URL).await {
            Ok(_) => println!("Database created"),
            Err(e) => eprintln!("Error creating database: {:?}", e),
        }
    }
    return SqlitePool::connect(DB_URL).await;
}

pub async fn init_db() -> Pool<Sqlite> {
    let db = connect().await.unwrap();

    sqlx::query("CREATE TABLE IF NOT EXISTS employee (id INTEGER PRIMARY KEY NOT NULL, name Char(100) NOT NULL, birth_date Date NOT NULL);").execute(&db).await.unwrap();
    return db;

    // let _date = date!(2022 - 10 - 10);
    // println!("date: {:?}", &_date);
    //
    // let result = sqlx::query("INSERT INTO employee (name, birth_date) VALUES (?, ?);")
    //     .bind("bobby1")
    //     .bind(&_date)
    //     .execute(&db)
    //     .await;
    // println!("insert dat result: {:?}, {:?}", &_date, result);

    // let employee = sqlx::query_as::<_, Employee>("SELECT * FROM employee;")
    //     .fetch_all(&db)
    //     .await
    //     .unwrap();
    //
    // for e in employee {
    //     println!("Employee: {:?}", e);
    // }
}

pub async fn insert_employee(
    db: &Pool<Sqlite>,
    name: String,
    birth_date: &Date,
) -> Result<SqliteQueryResult, sqlx::Error> {
    sqlx::query("INSERT INTO employee (name, birth_date) VALUES (?, ?);")
        .bind(name)
        .bind(birth_date)
        .execute(db)
        .await
}

pub async fn query_all_employee(db: &Pool<Sqlite>) -> Vec<Employee> {
    let employee = sqlx::query_as::<_, Employee>("SELECT * FROM employee;")
        .fetch_all(db)
        .await
        .unwrap();
    return employee;
}
