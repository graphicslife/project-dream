<?php
// donation.php - PHP clone of donation.html
// Handles donation form and logic for InfinityFree
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // TODO: Validate and save donation to MySQL
    $amount = $_POST['amount'] ?? '';
    $program = $_POST['program'] ?? '';
    // ...
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Make a Donation — Dream</title>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet">
</head>
<body class="antialiased text-gray-800 min-h-screen flex items-center justify-center">
  <div class="main-content w-full max-w-xl mx-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-yellow-200 ring-2 ring-yellow-100 flex flex-col items-center justify-center">
    <form method="POST">
      <input type="number" name="amount" placeholder="Amount" required class="w-full mb-4 px-4 py-2 border rounded-md" />
      <input type="text" name="program" placeholder="Program" required class="w-full mb-4 px-4 py-2 border rounded-md" />
      <button type="submit" class="w-full px-4 py-2 bg-success text-white rounded-md text-sm font-medium hover:bg-success-dark block">Donate</button>
    </form>
    <div id="donation-message" class="mt-4 text-center text-sm">
      <?php if (!empty($error)) echo $error; ?>
    </div>
    <div class="mt-2 text-center">
      <!-- ...existing links... -->
    </div>
  </div>
</body>
</html>
