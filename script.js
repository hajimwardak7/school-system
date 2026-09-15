/*
================================================
 SCHOOL MANAGEMENT SYSTEM - SECURITY
 Firebase License + Login + Role Security
================================================
*/

import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


(function () {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    /*
    ================================================
    PUBLIC PAGES
    ================================================
    */

    const publicPages = [
        "",
        "index.html",
        "license.html"
    ];


    /*
    ================================================
    ADMIN ONLY PAGES
    ================================================
    */

    const adminOnlyPages = [

        "students.html",
        "teachers.html",

        "teacher-reports.html",

        "fees.html",
        "student-fees.html",
        "monthly-fees.html",

        "fee-receipt.html",
        "fee-history.html",

        "financial-report.html",

        "monthly-attendance.html",
        "absent-report.html",

        "student-profile.html",
        "student-card.html",

        "search.html",

        "settings.html",
        "backup.html",

        "school-info.html",

        "reports.html"

    ];


    /*
    ================================================
    TEACHER ALLOWED PAGES
    ================================================
    */

    const teacherAllowedPages = [

        "",
        "index.html",

        "dashboard.html",

        "attendance.html"

    ];


    /*
    ================================================
    GET ROLE
    ================================================
    */

    function getRole() {

        return localStorage.getItem(
            "userRole"
        ) || "";

    }


    /*
    ================================================
    ADMIN CHECK
    ================================================
    */

    function isAdmin() {

        return getRole() === "admin";

    }


    /*
    ================================================
    TEACHER CHECK
    ================================================
    */

    function isTeacher() {

        return getRole() === "teacher";

    }


    /*
    ================================================
    DEVICE ID
    ================================================
    */

    function getDeviceId() {

        let deviceId =
            localStorage.getItem(
                "schoolDeviceId"
            );


        if (!deviceId) {

            deviceId =
                "DEVICE-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 12);


            localStorage.setItem(
                "schoolDeviceId",
                deviceId
            );

        }


        return deviceId;

    }


    /*
    ================================================
    FIREBASE LICENSE CHECK
    ================================================
    */

    async function verifyFirebaseLicense() {

        try {

            const licenseKey =
                localStorage.getItem(
                    "licenseKey"
                );


            const schoolId =
                localStorage.getItem(
                    "schoolId"
                );


            if (!licenseKey || !schoolId) {

                window.location.href =
                    "license.html";

                return false;

            }


            /*
            Firebase:
            licenses / LICENSE-KEY
            */

            const licenseRef =
                doc(
                    db,
                    "licenses",
                    licenseKey
                );


            const licenseSnap =
                await getDoc(
                    licenseRef
                );


            if (!licenseSnap.exists()) {

                clearLicense();

                alert(
                    "❌ License پیدا نه شو."
                );

                window.location.href =
                    "license.html";

                return false;

            }


            const license =
                licenseSnap.data();


            /*
            ========================================
            ACTIVE CHECK
            ========================================
            */

            if (
                license.active !== true
            ) {

                clearLicense();

                alert(
                    "❌ دا License غیر فعال شوی دی."
                );

                window.location.href =
                    "license.html";

                return false;

            }


            /*
            ========================================
            SCHOOL ID CHECK
            ========================================
            */

            if (
                String(license.schoolId || "")
                !==
                String(schoolId)
            ) {

                clearLicense();

                alert(
                    "❌ د School ID او License معلومات یو شان نه دي."
                );

                window.location.href =
                    "license.html";

                return false;

            }


            /*
            ========================================
            EXPIRATION CHECK
            ========================================
            */

            let expireDate;


            if (
                license.expiresAt &&
                typeof license.expiresAt.toDate === "function"
            ) {

                expireDate =
                    license.expiresAt.toDate();

            } else {

                expireDate =
                    new Date(
                        license.expiresAt
                    );

            }


            if (
                !expireDate ||
                isNaN(
                    expireDate.getTime()
                )
            ) {

                clearLicense();

                alert(
                    "❌ د License د ختمېدو نېټه ناسمه ده."
                );

                window.location.href =
                    "license.html";

                return false;

            }


            const now =
                new Date();


            if (
                expireDate.getTime()
                <
                now.getTime()
            ) {

                clearLicense();

                alert(
                    "⏰ ستاسو License ختم شوی دی."
                );

                window.location.href =
                    "license.html";

                return false;

            }


            /*
            ========================================
            DEVICE CHECK
            ========================================
            */

            const deviceId =
                getDeviceId();


            if (
                license.deviceId &&
                license.deviceId !== deviceId
            ) {

                clearLicense();

                alert(
                    "⛔ دا License په بل وسیله کې فعال شوی دی."
                );

                window.location.href =
                    "license.html";

                return false;

            }


            /*
            ========================================
            SAVE VERIFIED INFO
            ========================================
            */

            localStorage.setItem(
                "systemActivated",
                "true"
            );


            localStorage.setItem(
                "licenseKey",
                licenseKey
            );


            localStorage.setItem(
                "schoolId",
                license.schoolId
            );


            localStorage.setItem(
                "schoolName",
                license.schoolName || ""
            );


            localStorage.setItem(
                "licenseExpire",
                expireDate.toISOString()
            );


            localStorage.setItem(
                "licenseDeviceId",
                deviceId
            );


            return true;


        } catch (error) {

            console.error(
                "License verification error:",
                error
            );


            /*
            که Firebase موقتي Offline وي،
            سمدستي سیستم نه بندوو.
            خو که Local License هم موجود نه وي،
            Login ته اجازه نه ورکول کېږي.
            */

            const activated =
                localStorage.getItem(
                    "systemActivated"
                );


            const expire =
                localStorage.getItem(
                    "licenseExpire"
                );


            if (
                activated === "true" &&
                expire
            ) {

                const expireDate =
                    new Date(expire);


                if (
                    !isNaN(
                        expireDate.getTime()
                    ) &&
                    expireDate > new Date()
                ) {

                    return true;

                }

            }


            alert(
                "⚠️ د License تایید ممکن نه شو. انټرنېټ/Firebase وګورئ."
            );


            window.location.href =
                "license.html";


            return false;

        }

    }


    /*
    ================================================
    CLEAR LICENSE
    ================================================
    */

    function clearLicense() {

        localStorage.removeItem(
            "systemActivated"
        );

        localStorage.removeItem(
            "licenseKey"
        );

        localStorage.removeItem(
            "licenseExpire"
        );

        localStorage.removeItem(
            "licenseDeviceId"
        );

    }


    /*
    ================================================
    LOGIN CHECK
    ================================================
    */

    function checkLogin() {

        if (
            publicPages.includes(
                currentPage
            )
        ) {

            return true;

        }


        const loggedIn =
            localStorage.getItem(
                "adminLoggedIn"
            );


        if (
            loggedIn !== "true"
        ) {

            window.location.href =
                "index.html";

            return false;

        }


        return true;

    }


    /*
    ================================================
    TEACHER PAGE SECURITY
    ================================================
    */

    function checkTeacherAccess() {

        if (!isTeacher()) {

            return true;

        }


        if (
            !teacherAllowedPages.includes(
                currentPage
            )
        ) {

            alert(
                "⛔ تاسو یوازې د حاضري برخې ته لاسرسی لرئ."
            );


            window.location.href =
                "attendance.html";


            return false;

        }


        return true;

    }


    /*
    ================================================
    ADMIN PAGE SECURITY
    ================================================
    */

    function checkAdminAccess() {

        if (
            adminOnlyPages.includes(
                currentPage
            )
        ) {

            if (!isAdmin()) {

                alert(
                    "⛔ دې برخې ته یوازې Admin لاسرسی لري."
                );


                if (isTeacher()) {

                    window.location.href =
                        "attendance.html";

                } else {

                    window.location.href =
                        "index.html";

                }


                return false;

            }

        }


        return true;

    }


    /*
    ================================================
    RUN SECURITY
    ================================================
    */

    async function runSecurity() {

        /*
        License page
        */

        if (
            currentPage === "license.html"
        ) {

            return;

        }


        /*
        Public pages
        */

        if (
            currentPage === "" ||
            currentPage === "index.html"
        ) {

            return;

        }


        /*
        Firebase License verification
        */

        const licenseOK =
            await verifyFirebaseLicense();


        if (!licenseOK) {

            return;

        }


        /*
        Login
        */

        if (!checkLogin()) {

            return;

        }


        /*
        Admin
        */

        if (!checkAdminAccess()) {

            return;

        }


        /*
        Teacher
        */

        if (!checkTeacherAccess()) {

            return;

        }

    }


    /*
    ================================================
    USER FUNCTIONS
    ================================================
    */

    window.getCurrentUser =
        function () {

            let classes = [];


            try {

                classes =
                    JSON.parse(
                        localStorage.getItem(
                            "teacherClasses"
                        ) || "[]"
                    );

            } catch (error) {

                classes = [];

            }


            return {

                role:
                    localStorage.getItem(
                        "userRole"
                    ) || "",

                name:
                    localStorage.getItem(
                        "userName"
                    ) || "",

                teacherId:
                    localStorage.getItem(
                        "teacherId"
                    ) || "",

                teacherEmail:
                    localStorage.getItem(
                        "teacherEmail"
                    ) || "",

                classes:
                    classes

            };

        };


    /*
    ================================================
    PUBLIC ADMIN FUNCTION
    ================================================
    */

    window.isAdmin =
        function () {

            return isAdmin();

        };


    /*
    ================================================
    PUBLIC TEACHER FUNCTION
    ================================================
    */

    window.isTeacher =
        function () {

            return isTeacher();

        };


    /*
    ================================================
    LOGOUT
    ================================================
    */

    window.schoolLogout =
        function () {

            localStorage.removeItem(
                "adminLoggedIn"
            );

            localStorage.removeItem(
                "userRole"
            );

            localStorage.removeItem(
                "userName"
            );

            localStorage.removeItem(
                "teacherId"
            );

            localStorage.removeItem(
                "teacherEmail"
            );

            localStorage.removeItem(
                "teacherClasses"
            );


            window.location.href =
                "index.html";

        };


    /*
    ================================================
    LICENSE INFO
    ================================================
    */

    window.getLicenseInfo =
        function () {

            return {

                activated:
                    localStorage.getItem(
                        "systemActivated"
                    ) === "true",

                key:
                    localStorage.getItem(
                        "licenseKey"
                    ) || "",

                schoolId:
                    localStorage.getItem(
                        "schoolId"
                    ) || "",

                expire:
                    localStorage.getItem(
                        "licenseExpire"
                    ) || "",

                deviceId:
                    localStorage.getItem(
                        "licenseDeviceId"
                    ) || ""

            };

        };


    /*
    ================================================
    SCHOOL INFO
    ================================================
    */

    window.getSchoolInfo =
        function () {

            return {

                schoolName:
                    localStorage.getItem(
                        "schoolName"
                    ) ||
                    "د مکتب اداره",

                adminName:
                    localStorage.getItem(
                        "adminName"
                    ) ||
                    "مدیر",

                schoolPhone:
                    localStorage.getItem(
                        "schoolPhone"
                    ) || "",

                schoolId:
                    localStorage.getItem(
                        "schoolId"
                    ) || ""

            };

        };


    /*
    ================================================
    START
    ================================================
    */

    runSecurity();


})();