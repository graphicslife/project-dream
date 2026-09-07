<?php
// register.php - PHP clone of register.html
// Handles registration form and user creation logic for InfinityFree
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // TODO: Validate and create user
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    // Example: Insert user into MySQL
    // ...
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Register — Dream</title>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet">
</head>
<body class="antialiased text-gray-800 min-h-screen flex items-center justify-center" style="background: linear-gradient(135deg, #5a67d8 0%, #22c55e 40%, #16a34a 100%);">
  <div class="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-12 flex flex-col justify-center">
    <form method="POST">
      <input type="text" name="username" placeholder="Username" required class="w-full mb-4 px-4 py-2 border rounded-md" />
      <input type="email" name="email" placeholder="Email" required class="w-full mb-4 px-4 py-2 border rounded-md" />
      <input type="password" name="password" placeholder="Password" required class="w-full mb-4 px-4 py-2 border rounded-md" />
      <button type="submit" class="w-full px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark block">Register</button>
    </form>
    <div id="register-message" class="mt-4 text-center text-sm">
      <?php if (!empty($error)) echo $error; ?>
    </div>
    <div class="mt-2 text-center">
      <!-- ...existing links... -->
    </div>
  </div>
</body>
</html>
