document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productNameInput = document.getElementById("product-name");
    const productPriceInput = document.getElementById("product-price");
    const productList = document.getElementById("product-list");
    const totalPriceElement = document.getElementById("total-price");

    let totalPrice = 0;

    productForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value);

        if (name === "" || isNaN(price)) {
            alert("Por favor, insira um nome e um preço válidos.");
            return;
        }

        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox">
            <span>${name} - R$ ${price.toFixed(2)}</span>
            <button class="edit">Editar</button>
            <button class="delete">Excluir</button>
        `;
        
        li.querySelector(".edit").addEventListener("click", () => editProduct(li, name, price));
        li.querySelector(".delete").addEventListener("click", () => deleteProduct(li, price));

        productList.appendChild(li);
        
        totalPrice += price;
        updateTotalPrice();

        productNameInput.value = "";
        productPriceInput.value = "";
    });

    function editProduct(li, name, price) {
        const newName = prompt("Novo nome do produto:", name);
        const newPrice = parseFloat(prompt("Novo preço do produto:", price));

        if (newName && !isNaN(newPrice)) {
            li.querySelector("span").innerHTML = `${newName} - R$ ${newPrice.toFixed(2)}`;
            totalPrice -= price;
            totalPrice += newPrice;
            updateTotalPrice();
        }
    }

    function deleteProduct(li, price) {
        productList.removeChild(li);
        totalPrice -= price;
        updateTotalPrice();
    }

    function updateTotalPrice() {
        totalPriceElement.innerText = totalPrice.toFixed(2);
    }
});

