<?php
// forgot_password.php - PHP clone of forgot password.html
// Handles password reset form and logic for InfinityFree
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // TODO: Validate and process password reset
    $email = $_POST['email'] ?? '';
    // ...
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Forgot Password — Dream</title>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet">
  <style>
    body {
      background: linear-gradient(135deg, #5a67d8 0%, #434190 100%);
    }
  </style>
</head>
<body class="antialiased text-gray-800 min-h-screen flex items-center justify-center">
  <div class="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
    <form id="forgot-form" method="POST" class="space-y-5">
      <input type="email" name="email" placeholder="Email" required class="w-full mb-4 px-4 py-2 border rounded-md" />
      <button type="submit" class="w-full px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark block">Reset Password</button>
    </form>
    <div class="mt-6 text-center">
      <?php if (!empty($error)) echo $error; ?>
    </div>
  </div>
</body>
</html>
