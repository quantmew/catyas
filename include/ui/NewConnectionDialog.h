#ifndef NEWCONNECTIONDIALOG_H
#define NEWCONNECTIONDIALOG_H

#include <QDialog>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QGridLayout>
#include <QLabel>
#include <QLineEdit>
#include <QComboBox>
#include <QSpinBox>
#include <QCheckBox>
#include <QPushButton>
#include <QGroupBox>
#include <QTabWidget>
#include <QTextEdit>
#include <QSplitter>
#include <QTreeWidget>
#include <QStackedWidget>

enum DatabaseType {
    MySQL = 0,
    PostgreSQL,
    Oracle,
    SQLite,
    SQLServer,
    MariaDB,
    MongoDB
};

struct ConnectionSettings {
    DatabaseType type;
    QString connectionName;
    QString hostname;
    int port;
    QString username;
    QString password;
    QString database;
    QString filePath; // For SQLite
    bool savePassword;
    bool useSSL;

    // Advanced settings
    QString charset;
    int connectionTimeout;
    QString sslCertPath;
    QString sslKeyPath;
    QString sslCaPath;

    ConnectionSettings() {
        type = MySQL;
        port = 3306;
        savePassword = false;
        useSSL = false;
        charset = "utf8mb4";
        connectionTimeout = 30;
    }
};

class NewConnectionDialog : public QDialog
{
    Q_OBJECT

public:
    explicit NewConnectionDialog(QWidget *parent = nullptr);
    ~NewConnectionDialog();

    ConnectionSettings getConnectionSettings() const;
    void setConnectionSettings(const ConnectionSettings &settings);

private slots:
    void onDatabaseTypeChanged(int index);
    void onTestConnection();
    void onSelectSQLiteFile();
    void onConnectionNameChanged();
    void accept() override;

private:
    void setupUI();
    void setupDatabaseTypeList();
    void setupConnectionDetails();
    void setupAdvancedSettings();
    void setupButtons();

    void updateConnectionParameters();
    void updateDefaultPort();
    void validateInput();
    bool testDatabaseConnection();

    // UI Components
    QHBoxLayout *mainLayout;
    QSplitter *splitter;

    // Left panel - Database types
    QTreeWidget *databaseTypeTree;

    // Right panel - Connection details
    QStackedWidget *connectionStack;
    QWidget *connectionWidget;
    QVBoxLayout *rightLayout;

    // Connection info group
    QGroupBox *connectionInfoGroup;
    QGridLayout *connectionInfoLayout;
    QLineEdit *connectionNameEdit;
    QLineEdit *hostnameEdit;
    QSpinBox *portSpinBox;
    QLineEdit *usernameEdit;
    QLineEdit *passwordEdit;
    QLineEdit *databaseEdit;
    QLineEdit *filePathEdit;
    QPushButton *browseFileButton;
    QCheckBox *savePasswordCheck;
    QCheckBox *useSSLCheck;

    // Advanced settings group
    QGroupBox *advancedGroup;
    QGridLayout *advancedLayout;
    QComboBox *charsetCombo;
    QSpinBox *timeoutSpinBox;
    QLineEdit *sslCertEdit;
    QLineEdit *sslKeyEdit;
    QLineEdit *sslCaEdit;
    QPushButton *browseCertButton;
    QPushButton *browseKeyButton;
    QPushButton *browseCaButton;

    // Buttons
    QHBoxLayout *buttonLayout;
    QPushButton *testButton;
    QPushButton *okButton;
    QPushButton *cancelButton;

    // Current settings
    ConnectionSettings currentSettings;

    // Database type info
    struct DatabaseInfo {
        QString name;
        QString iconPath;
        int defaultPort;
        bool supportsSSL;
        bool requiresFile;
        QStringList supportedCharsets;
    };

    QMap<DatabaseType, DatabaseInfo> databaseInfo;
    void initializeDatabaseInfo();
};

#endif // NEWCONNECTIONDIALOG_H