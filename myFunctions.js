
$(document).ready(function () {

    //  Toggle details on click using jQuery slideToggle النقر بيطلع التفاصيل بال jquery معمول
    $(".detail-toggle").on("change", function () {
        var checkboxId = $(this).attr("id");
        var targetRowId = "#details-" + checkboxId;
        $(targetRowId).slideToggle();
    });

    //Show Booking Form when clicking Continue button after verifying car selection
    $("#btn-continue").on("click", function () {
        var selectedCars = $(".car-select:checked");
        if (selectedCars.length === 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل من الجدول قبل المتابعة.");
            return false;
        }

        // Display the reservation form smoothly
        $("#booking-form-wrapper").slideDown();

        // Scroll smoothly to form
        $("html, body").animate({
            scrollTop: $("#booking-form-wrapper").offset().top
        }, 500);
    });

    //  Close Result Modal
    $("#btn-close-modal").on("click", function () {
        $("#result-modal").fadeOut();
    });

    // Form Submission Event Handler
    $("#rentalForm").on("submit", function (e) {
        // Prevent default submission to perform client-side verification
        e.preventDefault();

        // Run validation function
        if (validateRentalForm()) {
            calculateAndDisplayTotal();
        }
    });

});

// Function to validate all form fields according to course specifications
function validateRentalForm() {

    //  Validate Name: Optional, but if entered must be Arabic letters and spaces only
    var nameField = document.getElementById("custName");
    var nameValue = nameField.value.trim();
    if (nameValue !== "") {
        var arabicPattern = /^[\u0621-\u064A\s]+$/;
        if (!arabicPattern.test(nameValue)) {
            alert("خطأ في الاسم الكامل: يجب إدخال أحرف هجائية عربية وفراغات فقط.");
            nameField.focus();
            nameField.select();
            return false;
        }
    }

    // Validate National ID: Mandatory, 11 digits, first two digits 01 to 14
    var nationalIdField = document.getElementById("nationalId");
    var nationalIdValue = nationalIdField.value.trim();
    if (nationalIdValue === "") {
        alert("حقل الرقم الوطني إلزامي، يرجى إدخال الرقم الوطني.");
        nationalIdField.focus();
        return false;
    }

    // Checking 11 digits and governorate prefix between 01 and 14
    var nationalIdPattern = /^(0[1-9]|1[0-4])\d{9}$/;
    if (!nationalIdPattern.test(nationalIdValue)) {
        alert("خطأ في الرقم الوطني: يجب أن يتألف من 11 رقماً، وأن تبدأ أول خانتين برمز محافظة سورية صحيح من 01 إلى 14.");
        nationalIdField.focus();
        nationalIdField.select();
        return false;
    }

    // Validate Start Date: Mandatory
    var startDateField = document.getElementById("startDate");
    var startDateValue = startDateField.value;
    if (startDateValue === "") {
        alert("تاريخ بداية التأجير إلزامي، يرجى تحديد تاريخ البداية.");
        startDateField.focus();
        return false;
    }

    // Validate End Date: Mandatory, strictly after Start Date
    var endDateField = document.getElementById("endDate");
    var endDateValue = endDateField.value;
    if (endDateValue === "") {
        alert("تاريخ نهاية التأجير إلزامي، يرجى تحديد تاريخ النهاية.");
        endDateField.focus();
        return false;
    }

    var start = new Date(startDateValue);
    var end = new Date(endDateValue);

    if (end <= start) {
        alert("خطأ في التواريخ: يجب أن يكون تاريخ نهاية التأجير لاحقاً لتاريخ البداية.");
        endDateField.focus();
        return false;
    }

    // validate Mobile: Optional, but if entered must match Syriatel or MTN (10 digits)
    var mobileField = document.getElementById("mobile");
    var mobileValue = mobileField.value.trim();
    if (mobileValue !== "") {
        // Syriatel: 093, 094, 095, 096, 098 | MTN: 099, 098, 092
        var mobilePattern = /^09(3|4|5|6|8|9|2)\d{7}$/;
        if (!mobilePattern.test(mobileValue)) {
            alert("خطأ في رقم الموبايل: يجب أن يتكون من 10 أرقام ويبدأ بمفتاح شبكة سورية صالح (مثل 093xxxxxxx أو 099xxxxxxx).");
            mobileField.focus();
            mobileField.select();
            return false;
        }
    }

    // Validate Email: Optional, but if entered must contain @ and a dot after @
    var emailField = document.getElementById("email");
    var emailValue = emailField.value.trim();
    if (emailValue !== "") {
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(emailValue) || emailValue.length < 6) {
            alert("خطأ في البريد الإلكتروني: يجب إدخال بريد إلكتروني صحيح بطول 6 محارف على الأقل ويحتوي على رمز @ ونقطة لاحقة له.");
            emailField.focus();
            emailField.select();
            return false;
        }
    }

    return true;
}

// Function to calculate rental days, costs, discounts and display output modal
function calculateAndDisplayTotal() {
    var startDateValue = document.getElementById("startDate").value;
    var endDateValue = document.getElementById("endDate").value;

    var start = new Date(startDateValue);
    var end = new Date(endDateValue);

    // Calculate difference in days
    var timeDiff = end.getTime() - start.getTime();
    var daysCount = Math.round(timeDiff / (1000 * 3600 * 24));

    if (daysCount <= 0) {
        daysCount = 1;
    }

    var baseTotal = 0;
    var htmlSummary = "<ul style='padding-right:20px; line-height:1.8;'>";

    // Iterate over selected cars
    $(".car-select:checked").each(function () {
        var carName = $(this).attr("data-name");
        var carPrice = parseInt($(this).attr("data-price"), 10);
        var carCost = carPrice * daysCount;
        baseTotal += carCost;

        htmlSummary += "<li><strong>" + carName + "</strong>: " + daysCount + " يوم &times; " + carPrice.toLocaleString('ar-SY') + " = " + carCost.toLocaleString('ar-SY') + " ل.س</li>";
    });

    htmlSummary += "</ul>";

    // Apply 5% discount if rental period exceeds 10 days
    var discountValue = 0;
    if (daysCount > 10) {
        discountValue = baseTotal * 0.05;
    }

    var finalAmount = baseTotal - discountValue;

    htmlSummary += "<hr />";
    htmlSummary += "<p><strong>عدد أيام التأجير:</strong> " + daysCount + " يوم</p>";
    htmlSummary += "<p><strong>المبلغ الإجمالي الأساسي:</strong> " + baseTotal.toLocaleString('ar-SY') + " ل.س</p>";

    if (discountValue > 0) {
        htmlSummary += "<p style='color:green;'><strong>قيمة حسم المدة (5%):</strong> " + discountValue.toLocaleString('ar-SY') + " ل.س</p>";
    } else {
        htmlSummary += "<p><strong>قيمة الحسم:</strong> 0 ل.س (الحسم يطبق للمدد التي تتجاوز 10 أيام)</p>";
    }

    htmlSummary += "<p style='font-size:16px; color:#d9534f;'><strong>المبلغ الإجمالي النهائي للدفع:</strong> " + finalAmount.toLocaleString('ar-SY') + " ل.س</p>";

    // Inject into modal and display
    document.getElementById("result-details").innerHTML = htmlSummary;
    $("#result-modal").fadeIn();
}
