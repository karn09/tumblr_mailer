var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('');
var client = tumblr.createClient({
	consumer_key: '',
	consumer_secret: ''
});

//console.log(client)
client.posts('jswonk.tumblr.com', function(err, blog) {
	var posts = latestPosts(blog.posts);
		// Find the new posts that you've written in the past 7 days
		// Create emails for multiple friends about your new posts by customizing the Template
		// You may want to include a link to the post, the title of each post, etc.
	csv_data.forEach(function(row) {
		var firstName = row["firstName"];
		var numMonthsSinceContact = row["numMonthsSinceContact"];
		var email = row["emailAddress"]
		var customizedTemplate = ejs.render(emailTemplate, {
			firstName: firstName,
			numMonthsSinceContact: numMonthsSinceContact,
			latestPosts: posts
		});
		console.log("Emailing: " + firstName + " at " + email)
		sendEmail(firstName, email, 'me', 'me@johnnieves.nyc', 'Adventures in JavaScript!', customizedTemplate);
		// console.log(customizedTemplate)
	})
})
var csvFile = fs.readFileSync("friend_list.csv", "utf8");
var emailTemplate = fs.readFileSync("email_template.html", "utf8");

function latestPosts(arr) {
	var postDate, prevSevenDays = Date.now(),
		latest = [];
	for (var i = 0, len = arr.length; i < len; i++) {
		postDate = Date.parse(arr[i].date);
		if (postDate > prevSevenDays) {
			latest.push(arr[i]);
		} else { // if no posts within last seven days, just first few posts found
			return arr.slice(0, 4);
		}
	}
	return latest;
}

function csvParse(csvFile) {
	var rows = csvFile.split('\n');
	var header = rows[0].split(',');
	var csvJSON = {};
	var arrayOfObj = [];
	for (var i = 1; i < rows.length; i++) {
		var currentRow = rows[i].split(',');
		if (currentRow.length === header.length) {
			for (var j = 0; j < currentRow.length; j++) {
				csvJSON[header[j]] = currentRow[j]
			}
			arrayOfObj.push(csvJSON);
		}
	};
	return arrayOfObj;
}

var csv_data = csvParse(csvFile)


// csv_data.forEach(function(row) {
// 	var firstName = row["firstName"];
// 	var sinceLastContact = row["numMonthsSinceContact"];

// 	var templateCopy = emailTemplate;

// 	templateCopy = templateCopy.replace(/FIRST_NAME/gi, firstName).replace(/NUM_MONTHS_SINCE_CONTACT/gi, sinceLastContact);
// 	console.log(templateCopy)
// })

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html) {
	var message = {
		"html": message_html,
		"subject": subject,
		"from_email": from_email,
		"from_name": from_name,
		"to": [{
			"email": to_email,
			"name": to_name
		}],
		"important": false,
		"track_opens": true,
		"auto_html": false,
		"preserve_recipients": true,
		"merge": false,
		"tags": [
			"Fullstack_Tumblrmailer_Workshop"
		]
	};
	var async = false;
	var ip_pool = "Main Pool";
	mandrill_client.messages.send({
		"message": message,
		"async": async,
		"ip_pool": ip_pool
	}, function(result) {
		// console.log(message);
		// console.log(result);   
	}, function(e) {
		// Mandrill returns the error as an object with name and message keys
		console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		// A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
	});
}

// csv_data.forEach(function(row) {
// 	var firstName = row["firstName"];
// 	var numMonthsSinceContact = row["numMonthsSinceContact"];

// 	var customizedTemplate = ejs.render(emailTemplate, {
// 		firstName: firstName,
// 		numMonthsSinceContact: numMonthsSinceContact,
// 		latestPosts: '12'
// 	});
// 	console.log(customizedTemplate)
// })