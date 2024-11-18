document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productNameInput = document.getElementById("product-name");
    const productPriceInput = document.getElementById("product-price");
    const productList = document.getElementById("product-list");
    const totalPriceElement = document.getElementById("total-price");

    let totalPrice = 0;

    // Restrição de entrada para o campo de preço
    productPriceInput.addEventListener("input", function(event) {
        this.value = this.value.replace(/[^0-9,]/g, '');
    });

    productForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value.replace(',', '.'));

        if (name === "" || isNaN(price)) {
            showMessage("Por favor, insira um nome e um preço válidos.", "error");
            return;
        }

        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox">
            <span>${name} - R$ ${price.toFixed(2)}</span>
            <button class="edit btn btn-link"><img src="assets/img/edit.svg" alt="Editar"></button>
            <button class="delete btn btn-link"><img src="assets/img/delete.svg" alt="Excluir"></button>
        `;
        
        li.querySelector(".edit").addEventListener("click", () => editProduct(li, name, price));
        li.querySelector(".delete").addEventListener("click", () => deleteProduct(li, price));

        productList.appendChild(li);
        
        totalPrice += price;
        updateTotalPrice();

        productNameInput.value = "";
        productPriceInput.value = "";

        showMessage("Produto adicionado com sucesso!");
    });

    function editProduct(li, name, price) {
        const newName = prompt("Novo nome do produto:", name);
        const newPrice = parseFloat(prompt("Novo preço do produto:", price.replace(',', '.')));

        if (newName && !isNaN(newPrice)) {
            li.querySelector("span").innerHTML = `${newName} - R$ ${newPrice.toFixed(2)}`;
            totalPrice -= price;
            totalPrice += newPrice;
            updateTotalPrice();

            showMessage("Produto editado com sucesso!");
        } else {
            showMessage("Por favor, insira um nome e um preço válidos.", "error");
        }
    }

    function deleteProduct(li, price) {
        productList.removeChild(li);
        totalPrice -= price;
        updateTotalPrice();

        showMessage("Produto excluído com sucesso!");
    }

    function updateTotalPrice() {
        totalPriceElement.innerText = totalPrice.toFixed(2);
    }

    function showMessage(message, type = 'success') {
        const messageBox = document.createElement('div');
        messageBox.className = `message ${type}`;
        messageBox.textContent = message;
        document.body.appendChild(messageBox);
        setTimeout(() => {
            document.body.removeChild(messageBox);
        }, 3000);
    }
});
