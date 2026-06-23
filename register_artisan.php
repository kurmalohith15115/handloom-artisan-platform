<?php

include "config/db.php";

$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$location = $_POST['location'];
$craft = $_POST['craft'];
$experience = $_POST['experience'];
$description = $_POST['description'];

$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

$imageName = time() . "_" . $_FILES['image']['name'];
$tmpName = $_FILES['image']['tmp_name'];

move_uploaded_file($tmpName, "uploads/" . $imageName);

$sql = "INSERT INTO artisans (
    name,
    email,
    phone,
    location,
    craft,
    experience,
    description,
    image,
    password
) VALUES (
    '$name',
    '$email',
    '$phone',
    '$location',
    '$craft',
    '$experience',
    '$description',
    '$imageName',
    '$password'
)";

if ($conn->query($sql)) {

    echo "
    <script>
        alert('Registration Successful');
        window.location.href='dashboard.php';
    </script>
    ";

} else {

    echo 'Error: ' . $conn->error;
}

?>