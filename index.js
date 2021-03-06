document.addEventListener('DOMContentLoaded', () => {
    var pay_button
    if (TPDirect.paymentRequestApi.checkAvailability()) {
        
        var data = {
            supportedNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
            supportedMethods: ['apple_pay'],
            displayItems: [{
                label: 'iPhone8',
                amount: {
                    currency: 'TWD',
                    value: '1.00'
                }
            }],
            total: {
                label: 'ไป็ตฆ TapPay',
                amount: {
                    currency: 'TWD',
                    value: '1.00'
                }
            },
            shippingOptions: [{
                    id: "standard",
                    label: "๐ Ground Shipping (2 days)",
                    // apple pay only
                    detail: 'Estimated delivery time: 2 days',
                    amount: {
                        currency: "TWD",
                        value: "5.00"
                    }
                },
                {
                    id: "drone",
                    label: "๐ Drone Express (2 hours)",
                    // apple pay only
                    detail: 'Estimated delivery time: 2 hours',
                    amount: {
                        currency: "TWD",
                        value: "25.00"
                    }
                },
            ],
            // optional
            options: {
                requestPayerEmail: false,
                requestPayerName: false,
                requestPayerPhone: false,
                requestShipping: false,
            }
        }

        TPDirect.setupSDK(11327, 'app_whdEWBH8e8Lzy4N6BysVRRMILYORF6UxXbiOFsICkz0J9j1C0JUlCHv1tVJC', 'sandbox')
        TPDirect.paymentRequestApi.setupApplePay({
            // required, your apple merchant id
            merchantIdentifier: 'merchant.tech.cherri.global.test',
            // defaults to 'TW'
            countryCode: 'TW'
        })
    
        TPDirect.paymentRequestApi.setupPaymentRequest(data, function (result) {
            console.log('TPDirect.paymentRequestApi.setupPaymentRequest.result', result)

            // ไปฃ่กจ็่ฆฝๅจๆฏๆด payment request api (ๆ apple pay)
            // ๅ TPDirect.paymentRequestApi.checkAvailability() ็็ตๆๆฏไธๆจฃ็
            // if (!result.browserSupportPaymentRequest) {
            //     return
            // }

            // ไปฃ่กจไฝฟ็จ่ๆฏๅฆๆ็ฌฆๅ supportedNetworks ่ supportedMethods ็ๅก็
            // paymentRequestApi ---> canMakePaymentWithActiveCard is result of canMakePayment
            // apple pay         ---> canMakePaymentWithActiveCard is result of canMakePaymentsWithActiveCard
            
            // NOTE: apple pay ๅชๆๆชขๆฅไฝฟ็จ่ๆฏๅฆๆๅจ apple pay ่ฃก้ข็ถๅก็
            if (result.canMakePaymentWithActiveCard) {
                document.getElementById('support').textContent = '่ฃ็ฝฎๅฏไปฅไฝฟ็จ PaymentRequest / Apple Pay'
                $('#apple-pay').addClass('buy')
            }
            else {
                // ๅฆๆๆๆฏๆด basic-card ๆนๅผ๏ผไป็ถๅฏไปฅ้ๅ payment request sheet
                // ๅฆๆๆฏ apple pay๏ผๆๅผๅฐไฝฟ็จ่ๅป apple pay ็ถๅก็
                document.getElementById('support').textContent = '่ฃ็ฝฎๆฏๆด PaymentRequest / Apple Pay๏ผไฝๆฏๆฒๆๅฏไปฅๆฏไป็ๅก็'
                $('#apple-pay').addClass('set-up')
            }

            if (window.ApplePaySession) {
                pay_button = document.getElementById('apple-pay')
                pay_button.style.display = 'inline-block';
            }

            pay_button.addEventListener('click', function (event) {
                TPDirect.paymentRequestApi.getPrime(function(result) {
                    console.log('paymentRequestApi.getPrime result', result)
                    handlePayByPrime(result, data)
                })
            })
        })
        document.getElementById('support').textContent = '่ฃ็ฝฎๆฏๆด PaymentRequest / Apple Pay'
    }
    else {
        $('.support').removeClass("info").addClass("error")
        document.getElementById('support').textContent = '่ฃ็ฝฎไธๆฏๆด PaymentRequest / Apple Pay'
    }
});

function handlePayByPrime(result, paymentRequest) {
    document.querySelector('#result1').innerHTML = JSON.stringify(result, null, 4)
    document.querySelector('.result1').classList.remove('hidden')
    document.querySelector('.curl').classList.remove('hidden')
    

    var command = `
    curl -X POST https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime \\
    -H 'content-type: application/json' \\
    -H 'x-api-key: partner_6ID1DoDlaPrfHw6HBZsULfTYtDmWs0q0ZZGKMBpp4YICWBxgK97eK3RM' \\
    -d '{
        "partner_key": "partner_6ID1DoDlaPrfHw6HBZsULfTYtDmWs0q0ZZGKMBpp4YICWBxgK97eK3RM",
        "prime": "${result.prime}",
        "amount": "${parseInt(result.total_amount)}",
        "merchant_id": "GlobalTesting_CTBC",
        "details": "Some item",
        "cardholder": {
            "phone_number": "0987654321",
            "name": "็ๅฐๆ",
            "email": "test@example.com",
            "zip_code": "123",
            "address": "ๅฐๅๅธxxx่กxx่",
            "national_id": "A123456789"
        }
    }'`.replace(/                /g, '')

    document.querySelector('#curl').innerHTML = command

}
