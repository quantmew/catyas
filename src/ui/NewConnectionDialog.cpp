#include "ui/NewConnectionDialog.h"
#include <QApplication>
#include <QMessageBox>
#include <QFileDialog>
#include <QStandardPaths>
#include <QTreeWidgetItem>

NewConnectionDialog::NewConnectionDialog(QWidget *parent)
    : QDialog(parent)
    , mainLayout(nullptr)
    , splitter(nullptr)
    , databaseTypeTree(nullptr)
    , connectionStack(nullptr)
    , connectionWidget(nullptr)
    , rightLayout(nullptr)
{
    setWindowTitle(tr("New Connection"));
    setModal(true);
    resize(700, 500);
    setMinimumSize(600, 400);

    initializeDatabaseInfo();
    setupUI();

    // Set default selection
    databaseTypeTree->setCurrentItem(databaseTypeTree->topLevelItem(0));
    onDatabaseTypeChanged(0);
}

NewConnectionDialog::~NewConnectionDialog()
{
}

void NewConnectionDialog::initializeDatabaseInfo()
{
    databaseInfo[MySQL] = {
        tr("MySQL"),
        ":/icons/mysql.png",
        3306,
        true,
        false,
        {"utf8mb4", "utf8", "latin1", "ascii"}
    };

    databaseInfo[PostgreSQL] = {
        tr("PostgreSQL"),
        ":/icons/postgresql.png",
        5432,
        true,
        false,
        {"UTF8", "LATIN1", "SQL_ASCII"}
    };

    databaseInfo[Oracle] = {
        tr("Oracle"),
        ":/icons/oracle.png",
        1521,
        true,
        false,
        {"UTF8", "AL32UTF8", "WE8ISO8859P1"}
    };

    databaseInfo[SQLite] = {
        tr("SQLite"),
        ":/icons/sqlite.png",
        0,
        false,
        true,
        {"UTF-8"}
    };

    databaseInfo[SQLServer] = {
        tr("SQL Server"),
        ":/icons/sqlserver.png",
        1433,
        true,
        false,
        {"UTF-8", "Latin1_General_CI_AS"}
    };

    databaseInfo[MariaDB] = {
        tr("MariaDB"),
        ":/icons/mariadb.png",
        3306,
        true,
        false,
        {"utf8mb4", "utf8", "latin1", "ascii"}
    };

    databaseInfo[MongoDB] = {
        tr("MongoDB"),
        ":/icons/mongodb.png",
        27017,
        true,
        false,
        {"UTF-8"}
    };
}

void NewConnectionDialog::setupUI()
{
    mainLayout = new QHBoxLayout(this);
    mainLayout->setContentsMargins(10, 10, 10, 10);
    mainLayout->setSpacing(10);

    splitter = new QSplitter(Qt::Horizontal, this);
    mainLayout->addWidget(splitter);

    setupDatabaseTypeList();
    setupConnectionDetails();

    splitter->addWidget(databaseTypeTree);
    splitter->addWidget(connectionWidget);
    splitter->setSizes({200, 500});
}

void NewConnectionDialog::setupDatabaseTypeList()
{
    databaseTypeTree = new QTreeWidget();
    databaseTypeTree->setHeaderLabel(tr("Database Type"));
    databaseTypeTree->setRootIsDecorated(false);
    databaseTypeTree->setMinimumWidth(180);
    databaseTypeTree->setMaximumWidth(250);

    // Add database types
    for (auto it = databaseInfo.begin(); it != databaseInfo.end(); ++it) {
        QTreeWidgetItem *item = new QTreeWidgetItem(databaseTypeTree);
        item->setText(0, it.value().name);
        item->setData(0, Qt::UserRole, static_cast<int>(it.key()));
        // item->setIcon(0, QIcon(it.value().iconPath)); // Icons can be added later
    }

    databaseTypeTree->setStyleSheet(
        "QTreeWidget { "
        "   background-color: #f8f8f8; "
        "   border: 1px solid #d0d0d0; "
        "   font-size: 13px; "
        "}"
        "QTreeWidget::item { "
        "   padding: 8px; "
        "   border: none; "
        "}"
        "QTreeWidget::item:selected { "
        "   background-color: #0078d4; "
        "   color: white; "
        "}"
        "QTreeWidget::item:hover { "
        "   background-color: #e5f3ff; "
        "}"
    );

    connect(databaseTypeTree, &QTreeWidget::currentItemChanged,
            this, [this](QTreeWidgetItem *current, QTreeWidgetItem *) {
                if (current) {
                    int type = current->data(0, Qt::UserRole).toInt();
                    onDatabaseTypeChanged(type);
                }
            });
}

void NewConnectionDialog::setupConnectionDetails()
{
    connectionWidget = new QWidget();
    rightLayout = new QVBoxLayout(connectionWidget);
    rightLayout->setContentsMargins(10, 10, 10, 10);
    rightLayout->setSpacing(15);

    setupConnectionInfo();
    setupAdvancedSettings();
    setupButtons();

    rightLayout->addStretch();
}

void NewConnectionDialog::setupConnectionInfo()
{
    connectionInfoGroup = new QGroupBox(tr("Connection"));
    connectionInfoLayout = new QGridLayout(connectionInfoGroup);
    connectionInfoLayout->setSpacing(10);

    int row = 0;

    // Connection Name
    connectionInfoLayout->addWidget(new QLabel(tr("Connection Name:")), row, 0);
    connectionNameEdit = new QLineEdit();
    connectionNameEdit->setPlaceholderText(tr("Enter connection name"));
    connectionInfoLayout->addWidget(connectionNameEdit, row++, 1);

    // Hostname
    connectionInfoLayout->addWidget(new QLabel(tr("Hostname:")), row, 0);
    hostnameEdit = new QLineEdit();
    hostnameEdit->setPlaceholderText(tr("localhost"));
    hostnameEdit->setText("localhost");
    connectionInfoLayout->addWidget(hostnameEdit, row++, 1);

    // Port
    connectionInfoLayout->addWidget(new QLabel(tr("Port:")), row, 0);
    portSpinBox = new QSpinBox();
    portSpinBox->setRange(1, 65535);
    portSpinBox->setValue(3306);
    connectionInfoLayout->addWidget(portSpinBox, row++, 1);

    // Username
    connectionInfoLayout->addWidget(new QLabel(tr("Username:")), row, 0);
    usernameEdit = new QLineEdit();
    usernameEdit->setPlaceholderText(tr("Enter username"));
    connectionInfoLayout->addWidget(usernameEdit, row++, 1);

    // Password
    connectionInfoLayout->addWidget(new QLabel(tr("Password:")), row, 0);
    passwordEdit = new QLineEdit();
    passwordEdit->setEchoMode(QLineEdit::Password);
    passwordEdit->setPlaceholderText(tr("Enter password"));
    connectionInfoLayout->addWidget(passwordEdit, row++, 1);

    // Database
    connectionInfoLayout->addWidget(new QLabel(tr("Database:")), row, 0);
    databaseEdit = new QLineEdit();
    databaseEdit->setPlaceholderText(tr("Enter database name"));
    connectionInfoLayout->addWidget(databaseEdit, row++, 1);

    // SQLite file path (initially hidden)
    connectionInfoLayout->addWidget(new QLabel(tr("Database File:")), row, 0);
    QHBoxLayout *fileLayout = new QHBoxLayout();
    filePathEdit = new QLineEdit();
    filePathEdit->setPlaceholderText(tr("Select SQLite database file"));
    browseFileButton = new QPushButton(tr("Browse..."));
    fileLayout->addWidget(filePathEdit);
    fileLayout->addWidget(browseFileButton);
    connectionInfoLayout->addLayout(fileLayout, row++, 1);

    // Options
    savePasswordCheck = new QCheckBox(tr("Save password"));
    connectionInfoLayout->addWidget(savePasswordCheck, row++, 1);

    useSSLCheck = new QCheckBox(tr("Use SSL"));
    connectionInfoLayout->addWidget(useSSLCheck, row++, 1);

    rightLayout->addWidget(connectionInfoGroup);

    // Connect signals
    connect(browseFileButton, &QPushButton::clicked, this, &NewConnectionDialog::onSelectSQLiteFile);
    connect(connectionNameEdit, &QLineEdit::textChanged, this, &NewConnectionDialog::onConnectionNameChanged);
}

void NewConnectionDialog::setupAdvancedSettings()
{
    advancedGroup = new QGroupBox(tr("Advanced"));
    advancedGroup->setCheckable(true);
    advancedGroup->setChecked(false);
    advancedLayout = new QGridLayout(advancedGroup);
    advancedLayout->setSpacing(10);

    int row = 0;

    // Charset
    advancedLayout->addWidget(new QLabel(tr("Character Set:")), row, 0);
    charsetCombo = new QComboBox();
    charsetCombo->setEditable(true);
    advancedLayout->addWidget(charsetCombo, row++, 1);

    // Connection timeout
    advancedLayout->addWidget(new QLabel(tr("Connection Timeout (s):")), row, 0);
    timeoutSpinBox = new QSpinBox();
    timeoutSpinBox->setRange(1, 300);
    timeoutSpinBox->setValue(30);
    advancedLayout->addWidget(timeoutSpinBox, row++, 1);

    // SSL Certificate
    advancedLayout->addWidget(new QLabel(tr("SSL Certificate:")), row, 0);
    QHBoxLayout *certLayout = new QHBoxLayout();
    sslCertEdit = new QLineEdit();
    browseCertButton = new QPushButton(tr("Browse..."));
    certLayout->addWidget(sslCertEdit);
    certLayout->addWidget(browseCertButton);
    advancedLayout->addLayout(certLayout, row++, 1);

    // SSL Key
    advancedLayout->addWidget(new QLabel(tr("SSL Key:")), row, 0);
    QHBoxLayout *keyLayout = new QHBoxLayout();
    sslKeyEdit = new QLineEdit();
    browseKeyButton = new QPushButton(tr("Browse..."));
    keyLayout->addWidget(sslKeyEdit);
    keyLayout->addWidget(browseKeyButton);
    advancedLayout->addLayout(keyLayout, row++, 1);

    // SSL CA
    advancedLayout->addWidget(new QLabel(tr("SSL CA:")), row, 0);
    QHBoxLayout *caLayout = new QHBoxLayout();
    sslCaEdit = new QLineEdit();
    browseCaButton = new QPushButton(tr("Browse..."));
    caLayout->addWidget(sslCaEdit);
    caLayout->addWidget(browseCaButton);
    advancedLayout->addLayout(caLayout, row++, 1);

    rightLayout->addWidget(advancedGroup);

    // Connect browse signals
    connect(browseCertButton, &QPushButton::clicked, [this]() {
        QString file = QFileDialog::getOpenFileName(this, tr("Select SSL Certificate"), "", tr("Certificate files (*.pem *.crt)"));
        if (!file.isEmpty()) sslCertEdit->setText(file);
    });

    connect(browseKeyButton, &QPushButton::clicked, [this]() {
        QString file = QFileDialog::getOpenFileName(this, tr("Select SSL Key"), "", tr("Key files (*.pem *.key)"));
        if (!file.isEmpty()) sslKeyEdit->setText(file);
    });

    connect(browseCaButton, &QPushButton::clicked, [this]() {
        QString file = QFileDialog::getOpenFileName(this, tr("Select SSL CA"), "", tr("CA files (*.pem *.crt)"));
        if (!file.isEmpty()) sslCaEdit->setText(file);
    });
}

void NewConnectionDialog::setupButtons()
{
    buttonLayout = new QHBoxLayout();
    buttonLayout->addStretch();

    testButton = new QPushButton(tr("Test Connection"));
    okButton = new QPushButton(tr("OK"));
    cancelButton = new QPushButton(tr("Cancel"));

    okButton->setDefault(true);
    testButton->setMinimumWidth(120);
    okButton->setMinimumWidth(80);
    cancelButton->setMinimumWidth(80);

    buttonLayout->addWidget(testButton);
    buttonLayout->addWidget(okButton);
    buttonLayout->addWidget(cancelButton);

    rightLayout->addLayout(buttonLayout);

    // Connect signals
    connect(testButton, &QPushButton::clicked, this, &NewConnectionDialog::onTestConnection);
    connect(okButton, &QPushButton::clicked, this, &NewConnectionDialog::accept);
    connect(cancelButton, &QPushButton::clicked, this, &QDialog::reject);
}

void NewConnectionDialog::onDatabaseTypeChanged(int index)
{
    DatabaseType type = static_cast<DatabaseType>(index);
    currentSettings.type = type;

    updateConnectionParameters();
    updateDefaultPort();
}

void NewConnectionDialog::updateConnectionParameters()
{
    DatabaseInfo info = databaseInfo[currentSettings.type];

    // Update charset options
    charsetCombo->clear();
    charsetCombo->addItems(info.supportedCharsets);
    if (!info.supportedCharsets.isEmpty()) {
        charsetCombo->setCurrentText(info.supportedCharsets.first());
    }

    // Show/hide file path for SQLite
    bool isFileDb = info.requiresFile;
    connectionInfoLayout->itemAtPosition(6, 0)->widget()->setVisible(isFileDb);
    connectionInfoLayout->itemAtPosition(6, 1)->setVisible(isFileDb);

    // Show/hide hostname and port for file-based databases
    connectionInfoLayout->itemAtPosition(1, 0)->widget()->setVisible(!isFileDb);
    connectionInfoLayout->itemAtPosition(1, 1)->widget()->setVisible(!isFileDb);
    connectionInfoLayout->itemAtPosition(2, 0)->widget()->setVisible(!isFileDb);
    connectionInfoLayout->itemAtPosition(2, 1)->widget()->setVisible(!isFileDb);

    // Enable/disable SSL options
    useSSLCheck->setEnabled(info.supportsSSL);
    if (!info.supportsSSL) {
        useSSLCheck->setChecked(false);
    }

    // Update connection name if empty
    if (connectionNameEdit->text().isEmpty()) {
        connectionNameEdit->setText(QString("%1 Connection").arg(info.name));
    }
}

void NewConnectionDialog::updateDefaultPort()
{
    DatabaseInfo info = databaseInfo[currentSettings.type];
    if (info.defaultPort > 0) {
        portSpinBox->setValue(info.defaultPort);
    }
}

void NewConnectionDialog::onSelectSQLiteFile()
{
    QString file = QFileDialog::getOpenFileName(
        this,
        tr("Select SQLite Database File"),
        QStandardPaths::writableLocation(QStandardPaths::DocumentsLocation),
        tr("SQLite Database Files (*.db *.sqlite *.sqlite3);;All Files (*)")
    );

    if (!file.isEmpty()) {
        filePathEdit->setText(file);
    }
}

void NewConnectionDialog::onTestConnection()
{
    if (testDatabaseConnection()) {
        QMessageBox::information(this, tr("Test Connection"), tr("Connection successful!"));
    } else {
        QMessageBox::warning(this, tr("Test Connection"), tr("Connection failed. Please check your settings."));
    }
}

void NewConnectionDialog::onConnectionNameChanged()
{
    validateInput();
}

bool NewConnectionDialog::testDatabaseConnection()
{
    // This is a placeholder - actual implementation would depend on the database drivers
    // For now, just validate that required fields are filled
    validateInput();

    if (connectionNameEdit->text().isEmpty()) {
        return false;
    }

    if (currentSettings.type == SQLite) {
        return !filePathEdit->text().isEmpty();
    } else {
        return !hostnameEdit->text().isEmpty() && !usernameEdit->text().isEmpty();
    }
}

void NewConnectionDialog::validateInput()
{
    bool valid = !connectionNameEdit->text().isEmpty();

    if (currentSettings.type == SQLite) {
        valid = valid && !filePathEdit->text().isEmpty();
    } else {
        valid = valid && !hostnameEdit->text().isEmpty();
    }

    okButton->setEnabled(valid);
    testButton->setEnabled(valid);
}

void NewConnectionDialog::accept()
{
    if (!testDatabaseConnection()) {
        QMessageBox::warning(this, tr("Invalid Connection"),
                           tr("Please fill in all required fields."));
        return;
    }

    // Save current settings
    currentSettings.connectionName = connectionNameEdit->text();
    currentSettings.hostname = hostnameEdit->text();
    currentSettings.port = portSpinBox->value();
    currentSettings.username = usernameEdit->text();
    currentSettings.password = passwordEdit->text();
    currentSettings.database = databaseEdit->text();
    currentSettings.filePath = filePathEdit->text();
    currentSettings.savePassword = savePasswordCheck->isChecked();
    currentSettings.useSSL = useSSLCheck->isChecked();
    currentSettings.charset = charsetCombo->currentText();
    currentSettings.connectionTimeout = timeoutSpinBox->value();
    currentSettings.sslCertPath = sslCertEdit->text();
    currentSettings.sslKeyPath = sslKeyEdit->text();
    currentSettings.sslCaPath = sslCaEdit->text();

    QDialog::accept();
}

ConnectionSettings NewConnectionDialog::getConnectionSettings() const
{
    return currentSettings;
}

void NewConnectionDialog::setConnectionSettings(const ConnectionSettings &settings)
{
    currentSettings = settings;

    // Update UI with settings
    connectionNameEdit->setText(settings.connectionName);
    hostnameEdit->setText(settings.hostname);
    portSpinBox->setValue(settings.port);
    usernameEdit->setText(settings.username);
    passwordEdit->setText(settings.password);
    databaseEdit->setText(settings.database);
    filePathEdit->setText(settings.filePath);
    savePasswordCheck->setChecked(settings.savePassword);
    useSSLCheck->setChecked(settings.useSSL);
    charsetCombo->setCurrentText(settings.charset);
    timeoutSpinBox->setValue(settings.connectionTimeout);
    sslCertEdit->setText(settings.sslCertPath);
    sslKeyEdit->setText(settings.sslKeyPath);
    sslCaEdit->setText(settings.sslCaPath);

    // Select the correct database type
    for (int i = 0; i < databaseTypeTree->topLevelItemCount(); ++i) {
        QTreeWidgetItem *item = databaseTypeTree->topLevelItem(i);
        if (item->data(0, Qt::UserRole).toInt() == static_cast<int>(settings.type)) {
            databaseTypeTree->setCurrentItem(item);
            onDatabaseTypeChanged(static_cast<int>(settings.type));
            break;
        }
    }
}