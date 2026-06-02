const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tambah wav ke daftar asset yang dikenali Metro
config.resolver.assetExts.push('wav');

module.exports = config;
