document.addEventListener("DOMContentLoaded", () => {

    // --- UTILS (Funções Auxiliares) ---
    const Utils = {
        // Formata um número para moeda brasileira (R$ X,XX)
        formatCurrency: (value) => {
            return value.toFixed(2).replace('.', ',');
        },
        // Converte uma string de preço (com vírgula) para float
        parsePrice: (priceString) => {
            return parseFloat(priceString.replace(',', '.'));
        },
        // Extrai dados de um item <li> do DOM
        extractProductDataFromLi: (li) => {
            const textContent = li.querySelector("span").innerText;
            const nameMatch = textContent.match(/^(.*?) - R\$/);
            const priceMatch = textContent.match(/R\$ ([\d,.]+) x/);
            const quantityMatch = textContent.match(/x (\d+)$/);
            const purchased = li.querySelector('input[type="checkbox"]').checked;

            let name = '';
            let price = 0;
            let quantity = 0;

            if (nameMatch) { name = nameMatch[1].trim(); }
            if (priceMatch) { price = Utils.parsePrice(priceMatch[1]); }
            if (quantityMatch) { quantity = parseInt(quantityMatch[1], 10); }

            return { name, price, quantity, purchased };
        },
        // Exibe mensagens de feedback
        showMessage: (message, type = 'success') => {
            const messageBox = document.createElement('div');
            messageBox.className = `message ${type}`;
            messageBox.textContent = message;
            document.body.appendChild(messageBox);
            setTimeout(() => {
                if (document.body.contains(messageBox)) {
                    document.body.removeChild(messageBox);
                }
            }, 3000);
        }
    };

    // --- UI MANAGER (Gerenciamento da Interface do Usuário) ---
    const UIManager = {
        productForm: document.getElementById("product-form"),
        productNameInput: document.getElementById("product-name"),
        productPriceInput: document.getElementById("product-price"),
        productQuantityInput: document.getElementById("product-quantity"),
        productList: document.getElementById("product-list"),
        totalPriceElement: document.getElementById("total-price"),
        clearAllBtn: document.getElementById("clear-all-btn"),

        editModal: document.getElementById("edit-modal"),
        closeModalBtn: document.getElementsByClassName("close")[0],
        editForm: document.getElementById("edit-form"),
        editProductNameInput: document.getElementById("edit-product-name"),
        editProductPriceInput: document.getElementById("edit-product-price"),
        editProductQuantityInput: document.getElementById("edit-product-quantity"),

        currentEditingProductLi: null, // Guarda a referência do <li> sendo editado

        // Cria e retorna um elemento <li> para a lista de produtos
        createProductListItem: (product) => {
            const li = document.createElement("li");
            if (product.purchased) {
                li.classList.add("purchased");
            }
            li.innerHTML = `
                <input type="checkbox" ${product.purchased ? 'checked' : ''}>
                <span>${product.name} - R$ ${Utils.formatCurrency(product.price)} x ${product.quantity}</span>
                <button class="btn-edit btn btn-link" aria-label="Editar ${product.name}"><img src="assets/img/edit.svg" alt="Editar"></button>
                <button class="btn-delete btn btn-link" aria-label="Excluir ${product.name}"><img src="assets/img/delete.svg" alt="Excluir"></button>
            `;
            return li;
        },

        // Abre a modal de edição
        openModal: (li, name, price, quantity) => {
            UIManager.currentEditingProductLi = li;
            UIManager.editProductNameInput.value = name;
            UIManager.editProductPriceInput.value = Utils.formatCurrency(price);
            UIManager.editProductQuantityInput.value = quantity;
            UIManager.editModal.style.display = "flex";
        },

        // Fecha a modal de edição
        closeModal: () => {
            UIManager.editModal.style.display = "none";
            UIManager.editProductNameInput.classList.remove("error");
            UIManager.editProductPriceInput.classList.remove("error");
            UIManager.editProductQuantityInput.classList.remove("error");
        },

        // Atualiza o display do preço total
        updateTotalPriceDisplay: (total) => {
            UIManager.totalPriceElement.innerText = Utils.formatCurrency(total);
        },

        // Limpa os campos do formulário de adição
        clearAddForm: () => {
            UIManager.productNameInput.value = "";
            UIManager.productPriceInput.value = "";
            UIManager.productQuantityInput.value = "1";
            UIManager.productNameInput.classList.remove("error");
            UIManager.productPriceInput.classList.remove("error");
            UIManager.productQuantityInput.classList.remove("error");
        },

        // Aplica/remove classe de erro nos campos
        toggleErrorClass: (element, isValid) => {
            if (isValid) {
                element.classList.remove("error");
            } else {
                element.classList.add("error");
            }
        },

        // Controla a visibilidade do botão "Limpar Tudo"
        toggleClearAllButtonVisibility: (hasProducts) => {
            if (hasProducts) {
                UIManager.clearAllBtn.style.display = "block"; // Ou "flex" se for o caso
            } else {
                UIManager.clearAllBtn.style.display = "none";
            }
        }
    };

    // --- PRODUCT MANAGER (Lógica de Negócios e Gerenciamento de Dados) ---
    const ProductManager = {
        products: [], // Armazena os produtos como objetos para facilitar a manipulação
        total: 0,

        // Carrega produtos do localStorage
        loadProducts: () => {
            const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
            ProductManager.products = []; // Limpa array antes de carregar
            ProductManager.total = 0; // Reinicia o total

            storedProducts.forEach(product => {
                // Garante que os dados carregados são números e booleanos
                product.price = parseFloat(product.price) || 0;
                product.quantity = parseInt(product.quantity, 10) || 0;
                product.purchased = product.purchased || false;

                const li = UIManager.createProductListItem(product);
                ProductManager.attachEventListeners(li, product); // Anexa listeners aqui
                UIManager.productList.appendChild(li);
                
                if (!product.purchased) {
                    ProductManager.total += product.price * product.quantity;
                }
                ProductManager.products.push(product); // Adiciona ao array de controle
            });
            UIManager.updateTotalPriceDisplay(ProductManager.total);
            // Atualiza a visibilidade do botão ao carregar a página
            UIManager.toggleClearAllButtonVisibility(ProductManager.products.length > 0);
        },

        // Salva produtos no localStorage
        saveProducts: () => {
            localStorage.setItem("products", JSON.stringify(ProductManager.products));
            // Atualiza a visibilidade do botão após salvar (e após qualquer modificação na lista)
            UIManager.toggleClearAllButtonVisibility(ProductManager.products.length > 0);
        },

        // Adiciona um novo produto
        addProduct: (name, price, quantity) => {
            const newProduct = { name, price, quantity, purchased: false };
            ProductManager.products.push(newProduct);
            
            const li = UIManager.createProductListItem(newProduct);
            ProductManager.attachEventListeners(li, newProduct);
            UIManager.productList.appendChild(li);

            ProductManager.total += newProduct.price * newProduct.quantity;
            UIManager.updateTotalPriceDisplay(ProductManager.total);
            Utils.showMessage("Produto adicionado com sucesso!");
            ProductManager.saveProducts(); // saveProducts já vai chamar toggleClearAllButtonVisibility
        },

        // Edita um produto existente
        editProduct: (oldProductLi, newName, newPrice, newQuantity) => {
            // Extrai os dados do produto que estava no DOM para encontrar o correspondente no array
            const oldProductData = Utils.extractProductDataFromLi(oldProductLi);
            const productIndex = ProductManager.products.findIndex(p => 
                p.name === oldProductData.name && 
                p.price === oldProductData.price && 
                p.quantity === oldProductData.quantity &&
                p.purchased === oldProductData.purchased // Inclui status para unicidade
            );

            if (productIndex !== -1) {
                const oldProduct = ProductManager.products[productIndex];

                // Recalcula o total apenas se o item não estava marcado como comprado
                if (!oldProduct.purchased) {
                    ProductManager.total -= oldProduct.price * oldProduct.quantity;
                }

                // Atualiza os dados no array de produtos
                oldProduct.name = newName;
                oldProduct.price = newPrice;
                oldProduct.quantity = newQuantity;

                // Atualiza o display no DOM (mantendo o status de comprado, se houver)
                oldProductLi.querySelector("span").innerHTML = 
                    `${newName} - R$ ${Utils.formatCurrency(newPrice)} x ${newQuantity}`;

                // Adiciona o novo valor ao total, se o item não estiver marcado como comprado
                if (!oldProduct.purchased) {
                    ProductManager.total += newPrice * newQuantity;
                }
                UIManager.updateTotalPriceDisplay(ProductManager.total);
                Utils.showMessage("Produto editado com sucesso!");
                ProductManager.saveProducts(); // saveProducts já vai chamar toggleClearAllButtonVisibility
            } else {
                Utils.showMessage("Erro ao editar produto: Produto não encontrado.", "error");
            }
        },

        // Exclui um produto
        deleteProduct: (li) => {
            if (!confirm("Tem certeza que deseja excluir este produto?")) {
                return;
            }

            const productData = Utils.extractProductDataFromLi(li);
            
            // Remove do array de produtos (usando filtro mais preciso)
            ProductManager.products = ProductManager.products.filter(p => 
                !(p.name === productData.name && 
                  p.price === productData.price && 
                  p.quantity === productData.quantity &&
                  p.purchased === productData.purchased) 
            );

            // Remove do DOM
            UIManager.productList.removeChild(li);
            
            // Recalcula o total se o item não estava comprado
            if (!productData.purchased) {
                ProductManager.total -= productData.price * productData.quantity;
            }
            UIManager.updateTotalPriceDisplay(ProductManager.total);
            Utils.showMessage("Produto excluído com sucesso!");
            ProductManager.saveProducts(); // saveProducts já vai chamar toggleClearAllButtonVisibility
        },

        // Limpa todos os produtos
        clearAllProducts: () => {
            if (confirm("Tem certeza que deseja limpar todos os produtos da lista?")) {
                UIManager.productList.innerHTML = "";
                ProductManager.products = []; // Esvazia o array de produtos
                ProductManager.total = 0;
                UIManager.updateTotalPriceDisplay(ProductManager.total);
                localStorage.removeItem("products");
                Utils.showMessage("Todos os produtos foram removidos!", "success");
                UIManager.toggleClearAllButtonVisibility(false); // Esconde o botão após limpar
            }
        },

        // Alterna o status de "comprado" de um produto
        togglePurchasedStatus: (li, isChecked) => {
            const productData = Utils.extractProductDataFromLi(li);
            // Encontra o produto no array, procurando pelo status oposto (o status que estava antes da mudança)
            const productIndex = ProductManager.products.findIndex(p => 
                p.name === productData.name && 
                p.price === productData.price && 
                p.quantity === productData.quantity &&
                p.purchased === !isChecked // Importante: busca pelo estado ANTERIOR do checkbox
            );

            if (productIndex !== -1) {
                const product = ProductManager.products[productIndex];
                product.purchased = isChecked; // Atualiza o status

                if (isChecked) {
                    li.classList.add("purchased");
                    ProductManager.total -= product.price * product.quantity;
                } else {
                    li.classList.remove("purchased");
                    ProductManager.total += product.price * product.quantity;
                }
                UIManager.updateTotalPriceDisplay(ProductManager.total);
                ProductManager.saveProducts(); // saveProducts já vai chamar toggleClearAllButtonVisibility
            }
        },

        // Anexa os event listeners aos botões de um item da lista (chamado ao criar/carregar LI)
        attachEventListeners: (li, product) => {
            li.querySelector(".btn-edit").addEventListener("click", () => 
                UIManager.openModal(li, product.name, product.price, product.quantity)
            );
            li.querySelector(".btn-delete").addEventListener("click", () => 
                ProductManager.deleteProduct(li)
            );
            li.querySelector('input[type="checkbox"]').addEventListener("change", (e) => 
                ProductManager.togglePurchasedStatus(li, e.target.checked)
            );
        }
    };

    // --- EVENT LISTENERS (Inicialização) ---

    // Event listener para o formulário de adição de produto
    UIManager.productForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = UIManager.productNameInput.value.trim();
        const price = Utils.parsePrice(UIManager.productPriceInput.value);
        const quantity = parseInt(UIManager.productQuantityInput.value, 10);

        let isValid = true;
        UIManager.toggleErrorClass(UIManager.productNameInput, name !== "");
        UIManager.toggleErrorClass(UIManager.productPriceInput, !isNaN(price) && price > 0);
        UIManager.toggleErrorClass(UIManager.productQuantityInput, !isNaN(quantity) && quantity > 0);

        if (name === "" || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            Utils.showMessage("Por favor, insira valores válidos para nome, preço e quantidade.", "error");
            isValid = false;
        }

        if (isValid) {
            ProductManager.addProduct(name, price, quantity);
            UIManager.clearAddForm();
        }
    });

    // Event listener para o formulário de edição na modal
    UIManager.editForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const newName = UIManager.editProductNameInput.value.trim();
        const newPrice = Utils.parsePrice(UIManager.editProductPriceInput.value);
        const newQuantity = parseInt(UIManager.editProductQuantityInput.value, 10);

        let isValid = true;
        UIManager.toggleErrorClass(UIManager.editProductNameInput, newName !== "");
        UIManager.toggleErrorClass(UIManager.editProductPriceInput, !isNaN(newPrice) && newPrice > 0);
        UIManager.toggleErrorClass(UIManager.editProductQuantityInput, !isNaN(newQuantity) && newQuantity > 0);

        if (newName === "" || isNaN(newPrice) || newPrice <= 0 || isNaN(newQuantity) || newQuantity <= 0) {
            Utils.showMessage("Por favor, insira valores válidos para nome, preço e quantidade.", "error");
            isValid = false;
        }

        if (isValid) {
            ProductManager.editProduct(UIManager.currentEditingProductLi, newName, newPrice, newQuantity);
            UIManager.closeModal();
        }
    });

    // Event listeners para a modal (fechar)
    UIManager.closeModalBtn.onclick = UIManager.closeModal;
    window.onclick = function(event) {
        if (event.target == UIManager.editModal) {
            UIManager.closeModal();
        }
    };

    // Restrição de entrada para campos de preço (permite apenas números e vírgula)
    UIManager.productPriceInput.addEventListener("input", function() {
        this.value = this.value.replace(/[^0-9,]/g, '');
    });
    UIManager.editProductPriceInput.addEventListener("input", function() {
        this.value = this.value.replace(/[^0-9,]/g, '');
    });

    // Event listener para o botão "Limpar Tudo"
    UIManager.clearAllBtn.addEventListener("click", ProductManager.clearAllProducts);

    // Carrega os produtos ao iniciar a aplicação
    ProductManager.loadProducts();
});