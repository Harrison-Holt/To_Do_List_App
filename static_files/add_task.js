document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("taskForm");
    let task_info = null;

    function getToken() {
        return localStorage.getItem("accessToken");
    }

    function getUserId() {
        return localStorage.getItem("user_id");
    }

    function isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000; // Convert to milliseconds
            return Date.now() > expiry; // ✅ True if expired, false if valid
        } catch (error) {
            console.error("❌ Error decoding token:", error);
            return true; // ✅ Assume expired if decoding fails
        }
    }

    function getTaskFromList(task_id) {
        return tasks_list.find((task) => task.task_id === Number(task_id)); // ✅ Convert task_id to a number
    }

    // ✅ Check Authentication
    const token = getToken();
    const user_id = getUserId();

    if (!token || !user_id || isTokenExpired(token)) {
        alert("⚠️ Unauthorized access. Please log in.");
        window.location.href = './login.html'; // ✅ Redirect unauthorized users
        return;
    }

    console.log("✅ User is authenticated.");
    console.log("Token:", token);
    console.log("User:", user_id);

    async function fetchAndLoadTasks() {
        try {
            const user_id = getUserId();
            if (!user_id) {
                alert("⚠️ User ID missing. Please log in again.");
                return;
            }

            const response = await fetch(
                `https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/get_tasks?user_id=${user_id}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const data = await response.json();
            window.tasks_list = data.tasks || [];
            console.log("✅ Fetched tasks:", window.tasks_list);

            const params = new URLSearchParams(window.location.search);
            const task_id = params.get("task_id");

            if (task_id) {
                console.log("🔹 Searching for task ID:", task_id);
                task_info = getTaskFromList(task_id);

                if (task_info) {
                    console.log("✅ Task found:", task_info);
                    document.getElementById("task_name").value = task_info.task_name;
                    document.getElementById("due_date").value = task_info.task_date.split("T")[0];
                    document.getElementById("due_time").value = task_info.task_time;
                    document.getElementById("select_priority").value = task_info.task_priority;
                } else {
                    console.error("❌ Task NOT found!");
                    alert("⚠️ Task not found.");
                }
            }
        } catch (error) {
            console.error("❌ Error fetching tasks:", error);
            alert("⚠️ Failed to load task data. Please try again.");
        }
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const task_name = document.getElementById("task_name").value.trim();
        const task_date = document.getElementById("due_date").value;
        const task_time = document.getElementById("due_time").value;
        const task_priority = document.getElementById("select_priority").value;
        const user_id = getUserId();

        if (!task_name || !task_date || !task_time || !task_priority) {
            alert("⚠️ Please fill out all required fields.");
            return;
        }

        const body = {
            user_id,
            task_name,
            task_date,
            task_time,
            task_priority,
            task_completed: "false",
        };

        if (task_info) {
            body.task_id = task_info.task_id;
        }

        const url = task_info
            ? `https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/update_task`
            : `https://ssfjhkn9w2.execute-api.us-east-1.amazonaws.com/dev/create_task`;
        const method = task_info ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error("Failed to save task data");
            }

            alert(task_info ? "✅ Task updated successfully!" : "✅ Task created successfully!");
            window.location.href = "index.html";
        } catch (error) {
            console.error("❌ Error saving task:", error);
            alert("⚠️ Failed to save task. Please try again.");
        }
    });

    fetchAndLoadTasks();
});


