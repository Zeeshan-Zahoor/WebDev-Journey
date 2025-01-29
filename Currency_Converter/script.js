
const baseURL = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies`;

const URL = `${baseURL}/${fromCurrency}.json`;

let response = () => {
    // Use it in async func. obviously
try {
    let response = await fetch(URL);

    let responseJSON = await response.json();

   let rate = responseJSON[fromCurrency][toCurrency];

    if (!response.ok) {
        throw new Error(`Network response was not ok`);
    }
} catch (error) {
    msg.innerHTML = `Failed to fetch exchange rate. Try again later.`;
    console.error("Fetch error:", error);
    return;
}

}