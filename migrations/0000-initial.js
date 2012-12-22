module.exports = [
    ['create_table', {
        name: 'data',
        columns: [
            ['id', 'integer', {primary_key: true, auto_increment: true}],
            ['object', 'varchar(255)'],
            ['signal', 'varchar(255)'],
            ['timestamp', 'integer'],
            ['value', 'double'],
        ]
    }]
];
