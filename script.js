document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productNameInput = document.getElementById("product-name");
    const productPriceInput = document.getElementById("product-price");
    const productQuantityInput = document.getElementById("product-quantity");
    const productList = document.getElementById("product-list");
    const totalPriceElement = document.getElementById("total-price");

    const editModal = document.getElementById("edit-modal");
    const closeModal = document.getElementsByClassName("close")[0];
    const editForm = document.getElementById("edit-form");
    const editProductNameInput = document.getElementById("edit-product-name");
    const editProductPriceInput = document.getElementById("edit-product-price");
    const editProductQuantityInput = document.getElementById("edit-product-quantity");

    let currentEditingProduct = null;
    let totalPrice = 0;

    // Carregar produtos do localStorage
    loadProductsFromLocalStorage();

    // Função para abrir a modal
    function openModal(li, name, price, quantity) {
        currentEditingProduct = li;
        editProductNameInput.value = name;
        editProductPriceInput.value = price.toFixed(2).replace('.', ',');
        editProductQuantityInput.value = quantity;
        editModal.style.display = "block";
    }

    // Função para fechar a modal
    function closeModalFunc() {
        editModal.style.display = "none";
    }

    // Fechar a modal quando o usuário clicar no "x"
    closeModal.onclick = function() {
        closeModalFunc();
    }

    // Fechar a modal quando o usuário clicar fora dela
    window.onclick = function(event) {
        if (event.target == editModal) {
            closeModalFunc();
        }
    }

    // Restringir entrada para o campo de preço na modal
    editProductPriceInput.addEventListener("input", function(event) {
        this.value = this.value.replace(/[^0-9,]/g, '');
    });

    // Atualizar o produto ao enviar o formulário da modal
    editForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const newName = editProductNameInput.value;
        const newPrice = parseFloat(editProductPriceInput.value.replace(',', '.'));
        const newQuantity = parseInt(editProductQuantityInput.value, 10);

        if (newName && !isNaN(newPrice) && !isNaN(newQuantity)) {
            const oldPrice = parseFloat(currentEditingProduct.querySelector("span").innerText.split(' - R$ ')[1].split(' x ')[0].replace(',', '.'));
            const oldQuantity = parseInt(currentEditingProduct.querySelector("span").innerText.split(' x ')[1]);

            currentEditingProduct.querySelector("span").innerHTML = `${newName} - R$ ${newPrice.toFixed(2).replace('.', ',')} x ${newQuantity}`;
            totalPrice -= oldPrice * oldQuantity;
            totalPrice += newPrice * newQuantity;
            updateTotalPrice();

            showMessage("Produto editado com sucesso!");
            closeModalFunc();

            // Atualizar localStorage
            saveProductsToLocalStorage();
        } else {
            showMessage("Por favor, insira valores válidos para nome, preço e quantidade.", "error");
        }
    });

    // Restringir entrada para o campo de preço
    productPriceInput.addEventListener("input", function(event) {
        this.value = this.value.replace(/[^0-9,]/g, '');
    });

    productForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = productNameInput.value;
        const price = parseFloat(productPriceInput.value.replace(',', '.'));
        const quantity = parseInt(productQuantityInput.value, 10);

        if (name === "" || isNaN(price) || isNaN(quantity)) {
            showMessage("Por favor, insira valores válidos para nome, preço e quantidade.", "error");
            return;
        }

        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox">
            <span>${name} - R$ ${price.toFixed(2).replace('.', ',')} x ${quantity}</span>
            <button class="btn-edit btn btn-link"><img src="assets/img/edit.svg" alt="Editar"></button>
            <button class="btn-delete btn btn-link"><img src="assets/img/delete.svg" alt="Excluir"></button>
        `;
        
        li.querySelector(".btn-edit").addEventListener("click", () => openModal(li, name, price, quantity));
        li.querySelector(".btn-delete").addEventListener("click", () => deleteProduct(li));

        productList.appendChild(li);
        
        totalPrice += price * quantity;
        updateTotalPrice();

        productNameInput.value = "";
        productPriceInput.value = "";
        productQuantityInput.value = "1";

        showMessage("Produto adicionado com sucesso!");

        // Atualizar localStorage
        saveProductsToLocalStorage();
    });

    function deleteProduct(li) {
        const price = parseFloat(li.querySelector("span").innerText.split(' - R$ ')[1].split(' x ')[0].replace(',', '.'));
        const quantity = parseInt(li.querySelector("span").innerText.split(' x ')[1]);
        productList.removeChild(li);
        totalPrice -= price * quantity;
        updateTotalPrice();

        showMessage("Produto excluído com sucesso!");

        // Atualizar localStorage
        saveProductsToLocalStorage();
    }

    function updateTotalPrice() {
        totalPriceElement.innerText = totalPrice.toFixed(2).replace('.', ',');
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

    function saveProductsToLocalStorage() {
        const products = [];
        productList.querySelectorAll("li").forEach(li => {
            const [name, priceQuantity] = li.querySelector("span").innerText.split(" - R$ ");
            const [price, quantity] = priceQuantity.split(" x ");
            products.push({ name, price, quantity });
        });
        localStorage.setItem("products", JSON.stringify(products));
    }

    function loadProductsFromLocalStorage() {
        const products = JSON.parse(localStorage.getItem("products")) || [];
        products.forEach(product => {
            const li = document.createElement("li");
            const price = parseFloat(product.price.replace(',', '.'));
            const quantity = parseInt(product.quantity, 10);

            li.innerHTML = `
                <input type="checkbox">
                <span>${product.name} - R$ ${product.price} x ${quantity}</span>
                <button class="btn-edit btn btn-link"><img src="assets/img/edit.svg" alt="Editar"></button>
                <button class="btn-delete btn btn-link"><img src="assets/img/delete.svg" alt="Excluir"></button>
            `;
            
            li.querySelector(".btn-edit").addEventListener("click", () => openModal(li, product.name, price, quantity));
            li.querySelector(".btn-delete").addEventListener("click", () => deleteProduct(li));

            productList.appendChild(li);
            totalPrice += price * quantity;
        });
        updateTotalPrice();
    }
});
