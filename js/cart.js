let cart = JSON.parse(localStorage.getItem("cart"));

if (!cart || cart.length === 0) {

    cart = [
        {
            name: "Traditional Handloom Saree",
            price: 2499
        },
        {
            name: "Cotton Fabric Roll",
            price: 1299
        },
        {
            name: "Handmade Bamboo Basket",
            price: 899
        }
    ];

    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price) {

    cart.push({
        name: name,
        price: price
    });

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(name + " added to cart!");
}

function displayCart() {

    let cartContainer = document.getElementById("cart-items");

    if (!cartContainer) return;

    let total = 0;

    cartContainer.innerHTML = "";

    cart.forEach((item, index) => {

        total += item.price;

        cartContainer.innerHTML += `
            <div class="cart-item">

                <div>
                    <h3>${item.name}</h3>
                    <p>₹${item.price}</p>
                </div>

                <button onclick="removeItem(${index})">
                    Remove
                </button>

            </div>
        `;
    });

    document.getElementById("total-price").innerHTML =
        `Total: ₹${total}`;
}

function removeItem(index) {

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}

displayCart();