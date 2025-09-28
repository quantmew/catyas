#ifndef DATABASECONNECTION_H
#define DATABASECONNECTION_H

#include <QString>
#include <QSqlDatabase>
#include <QSqlError>
#include <memory>

enum class DatabaseType {
    MySQL,
    PostgreSQL,
    SQLite,
    Oracle,
    SQLServer
};

struct ConnectionParams {
    QString name;
    DatabaseType type;
    QString hostname;
    int port;
    QString database;
    QString username;
    QString password;
    bool useSSL;
    QString sslCertPath;
    QString sslKeyPath;
    QString sslCaPath;
};

class DatabaseConnection
{
public:
    DatabaseConnection();
    explicit DatabaseConnection(const ConnectionParams &params);
    ~DatabaseConnection();

    bool connect();
    void disconnect();
    bool isConnected() const;

    QSqlDatabase& database();
    const QSqlDatabase& database() const;

    QString lastError() const;
    ConnectionParams connectionParams() const;

    static QString databaseTypeToString(DatabaseType type);
    static DatabaseType stringToDatabaseType(const QString &typeStr);

private:
    ConnectionParams m_params;
    QSqlDatabase m_database;
    QString m_lastError;
    bool m_isConnected;

    QString generateConnectionId() const;
    QString getDriverName(DatabaseType type) const;
};

#endif // DATABASECONNECTION_H