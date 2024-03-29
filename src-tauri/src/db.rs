#![allow(dead_code)]

use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::Result;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub(crate) struct DataEntry {
    pub(crate) name: String,
    pub(crate) age: i32,
}

#[tauri::command]
pub(crate) fn init_db() -> Result<()> {
    let conn = Connection::open("db.sqlite").unwrap();

    conn.execute(
        "CREATE TABLE IF NOT EXISTS data (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER NOT NULL
        )",
        [],
    )
    .unwrap();
    Ok(())
}

#[tauri::command]
pub(crate) fn insert_data(entry: &DataEntry) -> Result<()> {
    let conn = Connection::open("db.sqlite").unwrap();
    conn.execute(
        "INSERT INTO data (name, age) VALUES (?1, ?2)",
        [entry.name.to_string(), entry.age.to_string()],
    )
    .unwrap();
    println!("Data inserted");
    Ok(())
}

#[tauri::command]
pub(crate) fn get_all_data() -> Result<Vec<DataEntry>> {
    let conn = Connection::open("db.sqlite").unwrap();
    let mut stmt = conn.prepare("SELECT name, age FROM data").unwrap();
    let data_iter = stmt
        .query_map([], |row| {
            Ok(DataEntry {
                name: row.get(0)?,
                age: row.get(1)?,
            })
        })
        .unwrap();
    let mut data = Vec::new();
    for entry in data_iter {
        data.push(entry.unwrap());
    }
    Ok(data)
}

#[tauri::command]
pub(crate) fn update_data(entry: &DataEntry, id: i32) -> Result<()> {
    let conn = Connection::open("db.sqlite").unwrap();
    conn.execute(
        "UPDATE data SET name = ?1, age = ?2 WHERE id = ?3",
        [
            entry.name.to_string(),
            entry.age.to_string(),
            id.to_string(),
        ],
    )
    .unwrap();
    println!("Data updated id = {}", id);
    Ok(())
}

#[tauri::command]
pub(crate) fn delete_data(id: i32) -> Result<()> {
    let conn = Connection::open("db.sqlite").unwrap();
    conn.execute("DELETE FROM data WHERE id = ?1", [id.to_string()])
        .unwrap();
    println!("Data deleted id = {}", id);
    Ok(())
}
