<?php
// login.php - PHP clone of login.html
// Handles login form and authentication logic for InfinityFree
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // TODO: Validate and authenticate user
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    // Example: Query MySQL for user and verify password
    // ...
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login — Dream</title>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet">
</head>
<body class="antialiased text-gray-800 min-h-screen flex items-center justify-center">
  <div class="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-12 flex flex-col justify-center" style="min-height:480px;">
    <form method="POST">
      <input type="email" name="email" placeholder="Email" required class="w-full mb-4 px-4 py-2 border rounded-md" />
      <input type="password" name="password" placeholder="Password" required class="w-full mb-4 px-4 py-2 border rounded-md" />
      <button type="submit" class="w-full px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 block">Login</button>
    </form>
    <div id="login-message" class="mt-4 text-center text-sm">
      <?php if (!empty($error)) echo $error; ?>
    </div>
    <div class="mt-2 text-center">
      <!-- ...existing links... -->
    </div>
  </div>
</body>
</html>
