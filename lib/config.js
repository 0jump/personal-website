// File that contains all configurations for this server

let environments = {};


// Staging (Default) environment
environments.staging = {
    envName: 'staging',
    http:{
        port: 3000
    },
    mysql:{
        host: 'localhost',
        user: 'gerard',
        password: 'Limonade_1',
        database: 'gadb'
    }
}

// Production Environment
environments.production = {
    envName: 'production',
    http:{
        port: 80
    },
    mysql:{
        host: 'localhost',
        user: 'gerard',
        password: 'Limonade_1',
        database: 'gadb'
    }
}

// Determine which environment was passed as a command-line argument
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not, default to staging
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
