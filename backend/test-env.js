import dotenv from 'dotenv';

// Load environment variables
const result = dotenv.config();

if (result.error) {
  console.error('❌ Lỗi khi đọc file .env:', result.error.message);
  console.log('\n💡 Hãy đảm bảo file .env tồn tại trong thư mục gốc của dự án');
  process.exit(1);
}

console.log('✅ File .env đã được load thành công!\n');

// Kiểm tra các biến môi trường quan trọng
const requiredVars = [
  'AZURE_TENANT_ID',
  'AZURE_CLIENT_ID',
  'KAOPIZ_API_BASE_URL'
];

const optionalVars = [
  'AZURE_CLIENT_SECRET',
  'AZURE_REDIRECT_URI',
  'AZURE_SCOPE',
  'AZURE_AUTHORITY',
  'AZURE_TOKEN_ENDPOINT',
  'KAOPIZ_SOCIAL_LOGIN_ENDPOINT',
];

console.log('📋 Kiểm tra các biến môi trường:\n');

// Kiểm tra biến bắt buộc
console.log('🔴 Biến bắt buộc:');
let hasError = false;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`  ❌ ${varName}: CHƯA ĐƯỢC CẤU HÌNH`);
    hasError = true;
  }
});

console.log('\n🟡 Biến tùy chọn:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  } else {
    console.log(`  ⚠️  ${varName}: chưa được cấu hình (có thể cần thiết tùy trường hợp)`);
  }
});

if (hasError) {
  console.log('\n❌ Một số biến bắt buộc chưa được cấu hình!');
  console.log('💡 Hãy kiểm tra file .env và đảm bảo các biến trên đã được điền đầy đủ.');
  process.exit(1);
} else {
  console.log('\n✅ Tất cả biến bắt buộc đã được cấu hình!');
}
