use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::sync::Mutex;
use tauri::{AppHandle, State};
use tauri_plugin_shell::ShellExt;

#[derive(Serialize, Deserialize, Clone)]
struct Site {
    id: String,
    slug: String,
    data: String,
    created_at: String,
    updated_at: String,
}

struct DbState(Mutex<Connection>);

#[tauri::command]
async fn get_sites(state: State<'_, DbState>) -> Result<Vec<Site>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, slug, data, created_at, updated_at FROM sites ORDER BY slug")
        .map_err(|e| e.to_string())?;
    
    let sites_iter = stmt
        .query_map([], |row| {
            Ok(Site {
                id: row.get::<_, String>(0)?,
                slug: row.get::<_, String>(1)?,
                data: row.get::<_, String>(2)?,
                created_at: row.get::<_, String>(3)?,
                updated_at: row.get::<_, String>(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    
    let mut sites = Vec::new();
    for site in sites_iter {
        sites.push(site.map_err(|e| e.to_string())?);
    }
    
    Ok(sites)
}

#[tauri::command]
async fn get_site(slug: String, state: State<'_, DbState>) -> Result<Option<Site>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, slug, data, created_at, updated_at FROM sites WHERE slug = ?")
        .map_err(|e| e.to_string())?;
    
    let mut rows = stmt.query(params![slug]).map_err(|e| e.to_string())?;
    
    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        Ok(Some(Site {
            id: row.get::<_, String>(0).map_err(|e| e.to_string())?,
            slug: row.get::<_, String>(1).map_err(|e| e.to_string())?,
            data: row.get::<_, String>(2).map_err(|e| e.to_string())?,
            created_at: row.get::<_, String>(3).map_err(|e| e.to_string())?,
            updated_at: row.get::<_, String>(4).map_err(|e| e.to_string())?,
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn save_site(slug: String, data: String, state: State<'_, DbState>) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "UPDATE sites SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?",
        params![data, slug],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

#[tauri::command]
async fn export_site(app: AppHandle, slug: String, target_parent_dir: String) -> Result<String, String> {
    // 1. Run the build command
    let output = app.shell().command("bun")
        .args(["run", "build:core"])
        .env("BUILD_SLUG", &slug)
        .output()
        .await
        .map_err(|e| format!("Failed to execute build: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("Build process failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    // 2. Locate source directory (usually ./out/{slug})
    let source_dir = Path::new("out").join(&slug);
    if !source_dir.exists() {
        return Err(format!("Build finished but output directory not found at {:?}", source_dir));
    }

    // 3. Prepare destination directory (target_parent_dir/{slug})
    let dest_dir = Path::new(&target_parent_dir).join(&slug);
    
    // 4. Copy everything
    copy_dir_all(&source_dir, &dest_dir)
        .map_err(|e| format!("Failed to copy files to destination: {}", e))?;

    Ok(format!("Sitio '{}' exportado exitosamente a: {:?}", slug, dest_dir))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = "micrositios.db";
    let conn = Connection::open(db_path).expect("failed to open database");

    // Initialize tables if they don't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sites (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).expect("failed to create sites table");

    tauri::Builder::default()
        .manage(DbState(Mutex::new(conn)))
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_sites, get_site, save_site, export_site])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
