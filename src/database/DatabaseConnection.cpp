#include "database/DatabaseConnection.h"
#include <QSqlDatabase>
#include <QSqlError>
#include <QUuid>

DatabaseConnection::DatabaseConnection()
    : m_isConnected(false)
{
}

DatabaseConnection::DatabaseConnection(const ConnectionParams &params)
    : m_params(params)
    , m_isConnected(false)
{
}

DatabaseConnection::~DatabaseConnection()
{
    if (m_isConnected) {
        disconnect();
    }
}

bool DatabaseConnection::connect()
{
    if (m_isConnected) {
        return true;
    }

    QString connectionId = generateConnectionId();
    m_database = QSqlDatabase::addDatabase(getDriverName(m_params.type), connectionId);

    m_database.setHostName(m_params.hostname);
    m_database.setPort(m_params.port);
    m_database.setDatabaseName(m_params.database);
    m_database.setUserName(m_params.username);
    m_database.setPassword(m_params.password);

    if (m_database.open()) {
        m_isConnected = true;
        m_lastError.clear();
        return true;
    } else {
        m_lastError = m_database.lastError().text();
        m_isConnected = false;
        QSqlDatabase::removeDatabase(connectionId);
        return false;
    }
}

void DatabaseConnection::disconnect()
{
    if (m_isConnected && m_database.isOpen()) {
        QString connectionName = m_database.connectionName();
        m_database.close();
        QSqlDatabase::removeDatabase(connectionName);
        m_isConnected = false;
    }
}

bool DatabaseConnection::isConnected() const
{
    return m_isConnected && m_database.isOpen();
}

QSqlDatabase& DatabaseConnection::database()
{
    return m_database;
}

const QSqlDatabase& DatabaseConnection::database() const
{
    return m_database;
}

QString DatabaseConnection::lastError() const
{
    return m_lastError;
}

ConnectionParams DatabaseConnection::connectionParams() const
{
    return m_params;
}

QString DatabaseConnection::databaseTypeToString(DatabaseType type)
{
    switch (type) {
    case DatabaseType::MySQL:
        return "MySQL";
    case DatabaseType::PostgreSQL:
        return "PostgreSQL";
    case DatabaseType::SQLite:
        return "SQLite";
    case DatabaseType::Oracle:
        return "Oracle";
    case DatabaseType::SQLServer:
        return "SQL Server";
    }
    return "Unknown";
}

DatabaseType DatabaseConnection::stringToDatabaseType(const QString &typeStr)
{
    if (typeStr == "MySQL") return DatabaseType::MySQL;
    if (typeStr == "PostgreSQL") return DatabaseType::PostgreSQL;
    if (typeStr == "SQLite") return DatabaseType::SQLite;
    if (typeStr == "Oracle") return DatabaseType::Oracle;
    if (typeStr == "SQL Server") return DatabaseType::SQLServer;
    return DatabaseType::MySQL; // Default
}

QString DatabaseConnection::generateConnectionId() const
{
    return QString("conn_%1_%2").arg(m_params.name, QUuid::createUuid().toString());
}

QString DatabaseConnection::getDriverName(DatabaseType type) const
{
    switch (type) {
    case DatabaseType::MySQL:
        return "QMYSQL";
    case DatabaseType::PostgreSQL:
        return "QPSQL";
    case DatabaseType::SQLite:
        return "QSQLITE";
    case DatabaseType::Oracle:
        return "QOCI";
    case DatabaseType::SQLServer:
        return "QODBC";
    }
    return "QMYSQL";
}