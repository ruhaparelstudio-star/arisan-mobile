const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Load env file sesuai APP_ENV sebelum Metro mulai bundling
// Ini memastikan EXPO_PUBLIC_* ter-inline ke bundle dengan nilai yang benar
const APP_ENV = process.env.APP_ENV ?? 'development';
require('dotenv').config({
  path: path.resolve(__dirname, `.env.${APP_ENV}`),
  override: true,
});

const config = getDefaultConfig(__dirname);

// Tambah wav ke daftar asset yang dikenali Metro
config.resolver.assetExts.push('wav');

module.exports = config;
