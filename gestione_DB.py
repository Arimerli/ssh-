import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

#mi connetto al database di default
conn = psycopg2.connect(
    host="localhost", port=5432,
    dbname="postgres",
    user="postgres",
    password="password"
)
#per eseguire subito ogni comando, senza aspettare commit
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname = 'database'")
exists = cur.fetchone()

if not exists:
    cur.execute("CREATE DATABASE database")
    print("Database creato!")
else:
    print("Database già esistente")
conn.close()

#mi connetto al mio
conn = psycopg2.connect(
    host="localhost", port=5432,
    dbname="database",
    user="postgres",
    password="password"
)

cursore = conn.cursor()
cursore.execute("DROP TABLE IF EXISTS users")
cursore.execute("CREATE TABLE users ("
                "id SERIAL PRIMARY KEY,"
                "nome VARCHAR(255) NOT NULL,"
                "cognome VARCHAR(255) NOT NULL,"
                "email VARCHAR(255) NOT NULL,"
                "password VARCHAR(255) NOT NULL,"
                "permessi INT NOT NULL)")

cursore.execute("DROP TABLE IF EXISTS categories")
cursore.execute("CREATE TABLE categories ("
                "id SERIAL PRIMARY KEY,"
                "nome VARCHAR(255) NOT NULL,"
                "parent_id INT,"
                "FOREIGN KEY(parent_id) REFERENCES categories(id))")

cursore.execute("DROP TABLE IF EXISTS locations")
cursore.execute("CREATE TABLE locations ("
                "id SERIAL PRIMARY KEY,"
                "nome VARCHAR(255) NOT NULL,"
                "parent_id INT,"
                "FOREIGN KEY(parent_id) REFERENCES locations(id))")

cursore.execute("DROP TABLE IF EXISTS components")
cursore.execute("CREATE TABLE components ("
                "id SERIAL PRIMARY KEY,"
                "nome VARCHAR(255) NOT NULL,"
                "categoria INT NOT NULL,"
                "pezzi INT NOT NULL,"
                "link VARCHAR(255) NOT NULL,"
                "FOREIGN KEY (categoria) REFERENCES categories(id))")

cursore.execute("DROP TABLE IF EXISTS tags")
cursore.execute("CREATE TABLE tags ("
                "id SERIAL PRIMARY KEY,"
                "caratteristica VARCHAR(255) NOT NULL)")

cursore.execute("DROP TABLE IF EXISTS tag_components")
cursore.execute("CREATE TABLE tag_components ("
                "id SERIAL PRIMARY KEY,"
                "tag_id INT NOT NULL,"
                "component_id INT NOT NULL,"
                "FOREIGN KEY (tag_id) REFERENCES tags(id),"
                "FOREIGN KEY (component_id) REFERENCES components(id))")

cursore.execute("DROP TABLE IF EXISTS giacenze")
cursore.execute("CREATE TABLE giacenze("
                "id SERIAL PRIMARY KEY,"
                "componente_id INT NOT NULL,"
                "cassetto_id INT NOT NULL,"
                "quantita INT NOT NULL,"
                "min_quantita INT NOT NULL,"
                "scorta bool NOT NULL,"
                "FOREIGN KEY (componente_id) REFERENCES components(id),"
                "FOREIGN KEY (cassetto_id) REFERENCES locations(id))")

cursore.execute("DROP TABLE IF EXISTS esperienze")
cursore.execute("CREATE TABLE esperienze ("
                "id SERIAL PRIMARY KEY,"
                "nome VARCHAR(255) NOT NULL,"
                "descrizione VARCHAR(255))")

cursore.execute("DROP TABLE IF EXISTS esperienze_components")
cursore.execute("CREATE TABLE esperienze_components ("
                "id SERIAL PRIMARY KEY,"
                "esperienza_id INT NOT NULL,"
                "component_id INT NOT NULL,"
                "FOREIGN KEY (esperienza_id) REFERENCES esperienze(id),"
                "FOREIGN KEY (component_id) REFERENCES components(id))")

conn.commit()
conn.close()
print("yeah")
