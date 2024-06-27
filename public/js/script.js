document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('booking-form');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const vehicleOptions = document.getElementById('vehicle-options');
    const nextStep1Button = document.getElementById('next-step1');

    nextStep1Button.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateStep1()) {
            step1.style.display = 'none';
            step2.style.display = 'block';
            loadVehicleOptions();
        }
    });

    function validateStep1() {
        // Add your validation logic here
        return true; // Return false if validation fails
    }

    function loadVehicleOptions() {
        // In a real application, you would fetch this data from your server
        const vehicles = [
            { name: 'Executive Sedan', passengers: 4, luggage: 5 },
            { name: 'Executive SUV', passengers: 7, luggage: 5 },
            { name: 'Stretch Limousine', passengers: 8, luggage: 6 },
            { name: 'Party Bus', passengers: 20, luggage: 10 }
        ];

        vehicleOptions.innerHTML = ''; // Clear existing options

        vehicles.forEach(vehicle => {
            const vehicleElement = document.createElement('div');
            vehicleElement.classList.add('vehicle-option');
            vehicleElement.innerHTML = `
                <h4>${vehicle.name}</h4>
                <p>Passengers: ${vehicle.passengers}</p>
                <p>Luggage: ${vehicle.luggage}</p>
                <button class="btn request-quote" data-vehicle="${vehicle.name}">Request Quote</button>
                <button class="btn book" data-vehicle="${vehicle.name}">Book</button>
            `;
            vehicleOptions.appendChild(vehicleElement);
        });

        // Add event listeners for quote requests and booking
        document.querySelectorAll('.request-quote').forEach(button => {
            button.addEventListener('click', requestQuote);
        });

        document.querySelectorAll('.book').forEach(button => {
            button.addEventListener('click', proceedToBooking);
        });
    }

    function requestQuote(e) {
        const vehicle = e.target.dataset.vehicle;
        const rideDetails = getRideDetails();

        // In a real application, you would send this data to your server
        fetch('/api/quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vehicle, ...rideDetails }),
        })
        .then(response => response.json())
        .then(data => {
            alert(`Estimated price for ${vehicle}: $${data.price}`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching the quote. Please try again.');
        });
    }

    function proceedToBooking(e) {
        const vehicle = e.target.dataset.vehicle;
        // Save selected vehicle info (you might want to store this in a hidden input or in localStorage)
        localStorage.setItem('selectedVehicle', vehicle);
        step2.style.display = 'none';
        step3.style.display = 'block';
    }

    function getRideDetails() {
        return {
            serviceType: document.getElementById('service-type').value,
            pickupDate: document.getElementById('pickup-date').value,
            pickupTime: document.getElementById('pickup-time').value,
            pickupLocation: document.getElementById('pickup-location').value,
            dropoffLocation: document.getElementById('dropoff-location').value,
            passengers: document.getElementById('passengers').value,
            luggage: document.getElementById('luggage').value
        };
    }

    // Handle login
    document.getElementById('login-button').addEventListener('click', function(e) {
        e.preventDefault();
        // Add your login logic here
        alert('Login functionality to be implemented');
    });

    // Handle guest continue
    document.getElementById('guest-continue').addEventListener('click', function(e) {
        e.preventDefault();
        if (validateGuestInfo()) {
            // Add your booking submission logic here
            alert('Booking submitted successfully!');
        }
    });

    function validateGuestInfo() {
        // Add your validation logic here
        return true; // Return false if validation fails
    }
});

function submitBooking() {
    const rideDetails = getRideDetails();
    const selectedVehicle = localStorage.getItem('selectedVehicle');
    let userDetails;

    if (document.getElementById('login-email').value) {
        // User is logged in
        userDetails = {
            email: document.getElementById('login-email').value,
            // Add any other user details you want to include
        };
    } else {
        // Guest booking
        userDetails = {
            firstName: document.getElementById('guest-firstname').value,
            lastName: document.getElementById('guest-lastname').value,
            phone: document.getElementById('guest-phone').value,
            email: document.getElementById('guest-email').value
        };
    }

    const bookingData = {
        ...rideDetails,
        vehicle: selectedVehicle,
        user: userDetails
    };

    fetch('/api/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    })
    .then(response => response.json())
    .then(data => {
        alert(`Booking successful! Your booking ID is ${data.bookingId}`);
        // Here you might want to redirect to a booking confirmation page
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while submitting your booking. Please try again.');
    });
}

// Update the guest-continue button event listener
document.getElementById('guest-continue').addEventListener('click', function(e) {
    e.preventDefault();
    if (validateGuestInfo()) {
        submitBooking();
    }
});