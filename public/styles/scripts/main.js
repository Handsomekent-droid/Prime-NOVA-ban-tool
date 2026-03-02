document.getElementById('banForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const platform = document.getElementById('platform').value;
    const username = document.getElementById('username').value;
    const resultDiv = document.getElementById('result');

    // Clear previous results
    resultDiv.innerHTML = '';

    // Simulate ban action
    resultDiv.innerHTML = `Banning ${username} on ${platform}...`;

    // Send request to the server
    fetch('/ban', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform, username })
    })
    .then(response => response.json())
    .then(data => {
        resultDiv.innerHTML = data.result;
    })
    .catch(error => {
        resultDiv.innerHTML = `Error: ${error.message}`;
    });
});
          
