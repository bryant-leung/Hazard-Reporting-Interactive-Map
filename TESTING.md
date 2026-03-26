
Integration testing:

Registration testing:
    Here we began by testing the register feature in 4 different ways:
        Valid registration:
            We expected this to work correctly, and it did, allowing us to register. (See ![Register Valid](testing_evidence\register_valid.png) )
        Invalid email:
            In this test we used an invalid email, we expected not to be able to register, and for an error message to occur. 
            Our observed result was exactly this. (See ![Register Invalid](testing_evidence\register_invalid.png) )
        No inputs:
            In this test we inputted nothing, and we expected there to be an error message preventing registration.
            This matched up with what we observed (See ![Register No Inputs](testing_evidence\register_no_inputs.png) )
        Duplicate email:
            In this test we attempted to register with an email that had already been registered. 
            We expected this to cause a database error, and this matched with what we observed when we ran the test. (See ![Register Duplicate](testing_evidence\register_duplicate_email.png) )

Login testing:
    We tested the login feature in 5 different ways:
        Valid login:
            We expected this to work correctly and place us onto the main page, and it did, allowing us to login.
        Logout:
            After logging in, we expected pressing the logout button to send us back to the login page from the main page, and it did.
        Invalid email:
            In this test, we expected it to tell us that we needed a valid email, and when we entered the login, it did. (See ![Login Invalid Email](testing_evidence\login_syntactically_invalid.png) )
        Incorrect password:
            In this test, we expected to get an error saying invalid email/password and when we attemtped to login this is what we observed. See ![Login Invalid Email](testing_evidence\login_invalid_password.png)
        No inputs:
            In this test, we expected to be unable to login, and for the website to prompt us to enter an email/password to login.
            When we attempted to login with no inputs, this is what we observed ![Login No Inputs](testing_evidence\login_empty.png)

Guest view testing:
    We tested the guest features in 2 different ways:
        Guest dashboard:
            We expected that an unauthenticated user would be shown a dashboard with limited functionality and no ability to submit reports.
            This is exactly what we observed when accessing the application without logging in. (See ![Guest Dashboard](testing_evidence\guest_dashboard.png) )
        Guest map:
            We expected that a guest user would still be able to view the hazard map.
            This matched what we observed. (See ![Guest Map](testing_evidence\guest_map.png) )

Map testing:
    We tested the map functionality in 5 different ways:
        Zoom in:
            We expected that clicking the zoom in control would increase the map zoom level and show a more detailed view of the area.
            This is what we observed. (See ![Map Zoom In](testing_evidence\map_zoom_in.png) )
        Zoom out:
            We expected that clicking the zoom out control would decrease the map zoom level and show a wider area, and that when zooming out hazard pins disappeared so the map doesn't become cluttered.
            This is what we observed. (See ![Map Zoom Out](testing_evidence\map_zoom_out.png) )
        Nearby hazards section:
            We expected that the nearby hazards section below the map would display hazards geographically close to the user's current location.
            This is what we observed when viewing the section while logged in. (See ![Nearby Hazards](testing_evidence\nearby_hazards_section.png) )
        Valid Map Report Hazard: 
            We expected when reporting a hazard using the map with all categories filled in to get a pop up telling us that the report was submitted.
            This matched what we observed. (See ![Valid Report](testing_evidence\map_hazard_report_valid.png) )
        Invalid Map Report Hazard: 
            We expected when reporting a hazard using the map without all categories filled in to get a pop up telling us to fill out the description.
            This matched what we observed. (See ![Valid Report](testing_evidence\map_hazard_report_invalid.png) )

Report hazard page testing: 
    We tested the functionality of this page in a multitude of different ways:
        Valid inputs:
            We expected this to add the report to the database and provide a popup telling us that the report was submitted successfully.
            This matched what we observed. (See ![Valid Report](testing_evidence\report_hazard_invalid.png) )
        Missing hazard title, decription and location:
            We expected all of these to perform the same way, that if we tried to submit the report without entering these, we would get asked to fill in the field.
            This matched what we observed. (See ![Invalid Report](testing_evidence\report_hazard_invalid.png) )
        Missing latitude/longitude:
            We expected these to only allow us to enter numbers between -90 and 90 and that if we tried to submit the report without entering these, we would get asked to fill in the field.
            This was not the case, as we could input letters into the field, but it did still fail if we had no lat/long.
            This has since been fixed. (See ![Report Lat/Long](testing_evidence\report_hazard_latlong.png) )

Heatmap testing:
    We tested the heatmap display across 5 different time filters:
        Today:
            We expected the heatmap to only show hazard reports submitted on the current day.
            This matched what we observed. (See ![Heatmap Today](testing_evidence\display_heatmap_today.png) )
        Past week:
            We expected the heatmap to only show hazard reports submitted within the last week.
            This matched what we observed. (See ![Heatmap Past Week](testing_evidence\display_heatmap_past_week.png) )
        Past month:
            We expected the heatmap to only show hazard reports submitted within the last month.
            This matched what we observed. (See ![Heatmap Past Month](testing_evidence\display_heatmap_past_month.png) )
        Past year:
            We expected the heatmap to only show hazard reports submitted within the last year.
            This matched what we observed. (See ![Heatmap Past Year](testing_evidence\display_heatmap_past_year.png) )
        All time:
            We expected the heatmap to show all hazard report in the database.
            This matched what we observed. (See ![Heatmap All Time](testing_evidence\display_heatmap_all_time.png) )


Messaging testing:
    We tested the messaging/chat feature in 5 different ways:
        Send message:
            We expected that submitting a message would cause it to appear in the chat.
            This matched what we observed. (See ![Message Send](testing_evidence\message_send.png) )
        Vote on message:
            We expected that voting on a message would increase its votes and show that the vote had been registered.
            This is what we observed. (See ![Message Voted](testing_evidence\message_voted.png) )
        Remove vote:
            We expected that clicking the vote button again on an already voted on message would remove the vote and decrease the count.
            This matched what we observed. (See ![Message Remove Vote](testing_evidence\message_remove_vote.png) )
        View most voted:
            We expected that the most voted messages would be sorted to the top.
            This matched what we observed. (See ![Message View Most Voted](testing_evidence\message_view_most_voted.png) )
        Profanity filter:
            We expected that submitting a message containing profanity would be censored.
            This matched what we observed. (See ![Message Profanity](testing_evidence\message_profanity.png) )

Activity and notifications testing:
    We tested activity tracking and notification features in 2 different ways:
        Activity updates page:
            We expected the activity updates page to display a list of notifications regarding to the user's own reports and messages, ie upvotes on a message or updates to their report from an admin.
            This matched what we observed. (See ![Activity Updates Page](testing_evidence\activity_updates_page.png) )
        My reports page:
            We expected the my reports page to show all of the hazard reports submitted by the user.
            This matched what we observed. (See ![My Reports Page](testing_evidence\my_reports_page.png) )

Accessibility testing:
    We tested the accessibility features in 2 different ways:
        High contrast mode:
            We expected that enabling high contrast mode would update the UI colours to a higher contrast scheme to improve readability.
            This matched what we observed. (See ![High Contrast](testing_evidence\high_contrast.png) )
        Enlarged UI:
            We expected that enabling the enlarged UI option would increase the size of text and UI elements.
            This matched what we observed. (See ![Enlarged UI](testing_evidence\enlargen_ui.png) )

Staff dashboard testing:
    We tested the staff dashboard search and filter functionality through multiple parameters:
        Search by location:
            We expected that entering a location into the search field would filter the hazards to the specific location.
            This matched what we observed. (See ![Search By Location](testing_evidence\staff_dashboard_search_by_location.png) )
        Default sort (all):
            We expected the default view to show all hazard reports with no filters applied and for them to be sorted by date added, which is the default, instead of the severity level.
            This matched what we observed. (See ![Search Default Sort All](testing_evidence\staff_dashboard_search_default_sort_all_levels_all_categories.png) )
            Upon seeing how this was somewhat easy to misunderstand, we deicded to relabel the sort feature to make it more understandable.
        Sort highest to lowest severity:
            We expected that selecting this sort option would reorder the results with the most severe hazards at the top.
            This matched what we observed. (See ![Sort Highest to Lowest](testing_evidence\staff_dashboard_search_sort_highest_to_lo.png) )
        Sort lowest to highest severity:
            We expected that selecting this sort option would reorder the results with the least severe hazards at the top.
            This matched what we observed. (See ![Sort Lowest to Highest](testing_evidence\staff_dashboard_search_sort_lowest_to_hi.png) )
        Filter by severity - mild:
            We expected that filtering by mild severity would display only hazards marked as mild.
            This matched what we observed. (See ![Severity Mild](testing_evidence\staff_dashboard_search_severity_mild.png) )
            Upon seeing this, we realised that Mild was the incorrect labelling, and it was meant to be mild inconvenience, which we then changed.
        Filter by severity - major:
            We expected that filtering by major severity would display only hazards marked as major.
            This matched what we observed. (See ![Severity Major](testing_evidence\staff_dashboard_search_severity_major.png) )
            Upon seeing this, we realised that Major was the incorrect labelling, and it was meant to be major inconvenience, which we then changed, as this could be potentially misleading, for major to only be 2 on the scale.
        Filter by severity - potentially dangerous:
            We expected that filtering by potentially dangerous would display only hazards marked as potentially dangerous.
            This matched what we observed. (See ![Severity Potential](testing_evidence\staff_dashboard_search_severity_potentially_dangerous.png) )
        Filter by severity - dangerous:
            We expected that filtering by dangerous severity would display only hazards marked as dangerous.
            This matched what we observed. (See ![Severity Dangerous](testing_evidence\staff_dashboard_search_severity_dangerous.png) )
        Filter by severity - incredibly dangerous:
            We expected that filtering by the incredibly dangerous severity would display only the hazards marked as incredibly dangerous.
            This matched what we observed. (See ![Severity Incredible](testing_evidence\staff_dashboard_search_severity_incredibly_dangerous.png) )
        Filter by category - safety hazard:
            We expected that filtering by the safety hazard category would display only hazards marked as safety hazard.
            This matched what we observed. (See ![Category Safety Hazard](testing_evidence\staff_dashboard_search_category_safety_hazard.png) )
        Filter by category - infrastructure:
            We expected that filtering by the infrastructure category would display only hazards marked as infrastructure.
            This matched what we observed. (See ![Category Infrastructure](testing_evidence\staff_dashboard_search_category_infastructure.png) )
        Filter by category - vandalism:
            We expected that filtering by the vandalism category would display only hazards marked as vandalism.
            This matched what we observed. (See ![Category Vandalism](testing_evidence\staff_dashboard_search_category_vandalism.png) )
        Filter by category - other:
            We expected that filtering by the other category would display only hazards marked as other.
            This matched what we observed. (See ![Category Other](testing_evidence\staff_dashboard_search_category_other.png) )
        Filter by category - blocked:
            We expected that filtering by the blocked access ategory would display only hazards marked as blocked access.
            This matched what we observed. (See ![Category Blocked](testing_evidence\staff_dashboard_search_category_blocked_access.png) )
        Update hazard:
            We expected that updating an existing hazard would save the new details and give a pop-up letting know it was successful.
            This matched what we observed. (See ![Hazard Update](testing_evidence\hazard_update.png) )
        Delete hazard:
            We expected that deleting a hazard would remove it from the map and database.
            This is what we observed when we performed the deletion. (See ![Hazard Delete](testing_evidence\hazard_delete.png) )

Database testing:
    We tested the database state directly in 7 different ways to verify data was correctly maintained:
        Users table:
            We expected the users table to contain a record for each registered user with the correct details and a hashed password.
            This matched what we observed when inspecting the database. (See ![Database Users](testing_evidence\database_users.png) )
        Hazards table (1):
            We expected the hazards table to contain all submitted hazard reports.
            This matched what we observed. (See ![Database Hazards 1](testing_evidence\database_hazards_1.png) ) (See ![Database Hazards 2](testing_evidence\database_hazards_2.png) )
        Chat messages table:
            We expected the chat messages table to contain all sent messages and their corresponding metadata.
            This matched what we observed. (See ![Database Chat Messages](testing_evidence\database_chat_message.png) )
        Notifications table:
            We expected the notifications table to contain entries corresponding to the notifications being sent to each user.
            This matched what we observed. (See ![Database Notifications](testing_evidence\database_notifications.png) )
        Status updates table:
            We expected the status updates table to log each change in hazard status with the old version and the responsible admin.
            This matched what we observed. (See ![Database Status Updates](testing_evidence\database_status_updates.png) )
        Voted table:
            We expected the voted table to record which user upvoted which message.
            This matched what we observed. (See ![Database Voted](testing_evidence\database_voted.png) )


Unit testing:
    For the backend unit testing we wrote a script which takes every database connection from the db.js, mocks the database using jest and simulates database responses. We then used supertest to simulate HTTP requests to the API calls in server.js to test for correct HTTP responses from valid and invalid calls.

    For the frontend unit tests, it was a similar process, but instead we were testing for features being present on the web page.

    Both of these testing programs currently result in all tests passing. (Minor error due to there being a pool command within the backend tests, but these don't reflect on the functionality of the backend)

