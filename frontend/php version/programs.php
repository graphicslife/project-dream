<?php
// programs.php - PHP clone of programs.html
// Handles display of programs/projects for InfinityFree
// TODO: Fetch programs from MySQL and display
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Our Programs & Projects — Dream</title>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet">
</head>
<body class="antialiased text-gray-800 bg-gray-50">
  <header class="fixed inset-x-0 top-0 z-50 bg-white shadow-sm">
    <nav class="max-w-7xl mx-auto px-6 lg:px-8">
      <!-- ...existing nav markup... -->
    </nav>
  </header>
  <main class="pt-24 max-w-7xl mx-auto px-6 lg:px-8">
    <section class="text-center py-12">
      <h2 class="text-3xl font-bold text-primary mb-8">Our Programs & Projects</h2>
      <div id="programs-list">
        <?php
        // TODO: Loop through programs from DB
        ?>
      </div>
    </section>
  </main>
</body>
</html>
