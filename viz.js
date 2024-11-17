// Data from https://data.cityofnewyork.us/City-Government/DSNY-Monthly-Tonnage-Data/ebb7-mvp5/about_data
// As I was making edits from my revision, I focused on what story I wanted to tell. 
// I moved to a Jupyter notebook and did some analysis there and saw the cyclic nature of the waste which was really intriguing to me.
// I then fixated on this monthly waste, and tried to represent that. At first, I experimented with a rose graph
// because I think it captures the cycle of months well, but that didn't do a great job showing the differences in the months, so
// I switched back to the bar graph.

// Then I wanted to include an alternate view through the years and found the peaks in the early 2000s and around 2020 particularly intriguing.
// I used ChatGPT to help me debug as well as to help with some of the different button functionality.
let data, yearlyData;
let progress, gotham;
let showRefuse = true;
let showPaper = true;
let showMGP = true;
//let currentView = "monthly"; // Track if viewing monthly or yearly data
let selectedMonth = null;
let backButton;
let monthDropdown;
const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function preload() {
  data = loadTable('Monthly_Tonnage_per_Day.csv', 'csv', 'header'); // Assuming pre-aggregated monthly data
  progress = loadFont('ProgressPersonalUse-EaJdz.ttf');
  yearlyData = loadTable('Monthly_Tonnage_per_Day_-_New_Dataset.csv', 'csv', 'header');
  gotham = loadFont('Gotham-Bold.otf');
}

let currentView = "overview"; // Start with the overview view

function setup() {
  createCanvas(1300, 700);
  noLoop();
  background('#ECECEC');
  createBackButton();
  createMonthDropdown();
	
}

function draw() {
  noStroke();
  background('#DADADA');

  if (currentView === "overview") {
    drawOverviewLineGraph(); // Show the overview line graph of refuse over time
    backButton.hide();
  } else if (currentView === "monthly") {
    drawStackedBarChart();
    backButton.hide();
  } else if (currentView === "yearly") {
		
    drawYearlyChart();
    backButton.show();
  }
  drawLayout();
  
  if (currentView !== "yearly" && monthDropdown) {
    monthDropdown.hide();
  }
	noStroke();
	textFont(gotham);
  textSize(11);
  let textStr = "SHOWN IN TONS PER DAY";
  let x = 100; // Starting x position for subtitle
  let y = height - 50; // y position for subtitle
  let letterSpacing = 4.3;
	for (let i = 0; i < textStr.length; i++) {
    let letter = textStr.charAt(i);
    text(letter, x, y);
    x += textWidth(letter) + letterSpacing;
  }
}

function drawOverviewLineGraph() {
  // Extract refuse data over time
  let dates = yearlyData.getColumn("MONTH");
  let refuseData = [];

  for (let i = 0; i < yearlyData.getRowCount(); i++) {
    let year = int(dates[i].split("-")[0]);
    if (year >= 1994 && year <= 2023) {
      refuseData.push(float(yearlyData.getString(i, "REFUSETONSDAY")));
    }
  }

	textFont(gotham);
  textSize(11);
	fill('#794722');
  let textStr = "CLICK ANYWHERE TO EXPLORE THE CYCLES OF WASTE IN NYC";
  let x = width - 700; // Starting x position for subtitle
  let y = height - 50; // y position for subtitle
  let letterSpacing = 4.3;
	for (let i = 0; i < textStr.length; i++) {
    let letter = textStr.charAt(i);
    text(letter, x, y);
    x += textWidth(letter) + letterSpacing;
  }
	fill(0);
  // Find max refuse tonnage for scaling
  let maxRefuse = max(refuseData);
  
  stroke(0);
  noFill();
  beginShape();
  for (let i = 0; i < refuseData.length; i++) {
    let x = map(i, 0, refuseData.length - 1, 100, width - 100);
    let y = map(refuseData[i], 0, maxRefuse, height + 100, 300);
    vertex(x, y);
  }
  endShape();
	noStroke();
}

function mousePressed() {
  // Transition from overview to monthly view on click
  if (currentView === "overview") {
    currentView = "monthly";
		createToggles();
    redraw();
  } else if (currentView === "monthly") {
    // Existing code for selecting a month in the monthly view
    let months = data.getColumn("Month");
    let barWidth = (width - 200) / months.length;

    for (let i = 0; i < months.length; i++) {
      let x = i * barWidth + 100;

      if (mouseX > x && mouseX < x + barWidth - 10 && mouseY > height - 350 && mouseY < height - 100) {
        selectedMonth = int(months[i]);
        currentView = "yearly";
        updateMonthDropdown();
        redraw();
        break;
      }
    }
  }
}

function createBackButton() {
  // Create a button to switch back to monthly view
  backButton = createButton('BACK TO MONTHLY VIEW')
    .position(width - 320, 170)
    .mousePressed(() => {
      currentView = "monthly";
      selectedMonth = null;
      monthDropdown.hide(); // Hide dropdown when switching back to monthly view
		backButton.hide();
      redraw(); // Trigger redraw on button press
    });

  // Apply the same styling for the back button
  updateButtonStyle(backButton, true, '#576080'); 
	
}
function createToggles() {
	 if (currentView === "monthly" || currentView === "yearly") {
		let refuseButton = createButton('Toggle Waste')
			.position(width - 425, height - 40)
			.mousePressed(() => {
				showRefuse = !showRefuse;
				updateButtonStyle(refuseButton, showRefuse, '#794722'); // Update style based on active state
				redraw(); // Trigger redraw on toggle
			});

		let paperButton = createButton('Toggle Paper')
			.position(width - 300, height - 40)
			.mousePressed(() => {
				showPaper = !showPaper;
				updateButtonStyle(paperButton, showPaper, '#576080'); // Update style based on active state
				redraw(); // Trigger redraw on toggle
			});

		let mgpButton = createButton('Toggle Plastic')
			.position(width - 175, height - 40)
			.mousePressed(() => {
				showMGP = !showMGP;
				updateButtonStyle(mgpButton, showMGP, '#787D80'); // Update style based on active state
				redraw(); // Trigger redraw on toggle
			});

		// Initial styles based on initial toggle states
		updateButtonStyle(refuseButton, showRefuse, '#794722');
		updateButtonStyle(paperButton, showPaper, '#576080');
		updateButtonStyle(mgpButton, showMGP, '#787D80');
	 }
}

function drawLayout() {
  // Draw title
  textAlign(LEFT, CENTER);
  textFont(progress);
  fill(0);
  textSize(80);
  scale(1, 1.5);
  text('THE DIRTY APPLE', 100, 90);

  // Draw subtitle with letter spacing
  scale(1, 0.66);
  textFont(gotham);
  textSize(12);
  let textStr = "DAILY WASTE DISPOSAL BY MONTH IN NEW YORK CITY FROM 1994 TO 2023";
  let x = 100; // Starting x position for subtitle
  let y = 90; // y position for subtitle
  let letterSpacing = 4.3;

  for (let i = 0; i < textStr.length; i++) {
    let letter = textStr.charAt(i);
    text(letter, x, y);
    x += textWidth(letter) + letterSpacing;
  }

  // Draw bottom line
  stroke(0);
  strokeWeight(5);
  line(100, height - 95, width - 100, height - 95);
  strokeWeight(3);
}

function createMonthDropdown() {
  // Create dropdown menu for selecting a month
  monthDropdown = createSelect();
  monthDropdown.position(width - 320, 125);  // Position it in the top-right corner
  monthDropdown.option("JAN"); // Add all months
  monthDropdown.option("FEB");
  monthDropdown.option("MAR");
  monthDropdown.option("APR");
  monthDropdown.option("MAY");
  monthDropdown.option("JUN");
  monthDropdown.option("JUL");
  monthDropdown.option("AUG");
  monthDropdown.option("SEP");
  monthDropdown.option("OCT");
  monthDropdown.option("NOV");
  monthDropdown.option("DEC");

  // When the user selects a new month, update the selectedMonth
  monthDropdown.changed(() => {
    let selectedMonthName = monthDropdown.value();
    selectedMonth = monthNames.indexOf(selectedMonthName) + 1; // Get month number (1-12)
    redraw(); // Redraw the chart with the new month
  });

	monthDropdown.style('background-color', '#794722'); // Blue background (same as "Toggle Paper")
  monthDropdown.style('color', 'white'); // White text color for contrast
  monthDropdown.style('border', '2px solid #794722'); // Border color matching the background
  monthDropdown.style('border-radius', '8px'); // Slightly larger border radius for a bigger look
  monthDropdown.style('padding', '16px 24px'); // Increased padding for a larger dropdown
  monthDropdown.style('font-size', '18px'); // Larger font size for better visibility
  monthDropdown.style('font-family', gotham.name); // Use the same font family as toggles
  monthDropdown.style('cursor', 'pointer'); // Change cursor to a pointer on hover
  monthDropdown.style('transition', 'all 0.3s ease-in-out');  // Smooth transition on change
  monthDropdown.hide(); // Hide the dropdown initially, show only in the yearly view

  monthDropdown.hide(); // Hide the dropdown initially, show only in the yearly view
}

function updateMonthDropdown() {
  // Update the dropdown based on the selected month
  if (selectedMonth !== null) {
    monthDropdown.selected(monthNames[selectedMonth - 1]); // Set the dropdown to the selected month
    monthDropdown.show(); // Show the dropdown only in yearly view
  }
}

function drawStackedBarChart() {
  textSize(10);
  strokeWeight(1);
  let months = data.getColumn("Month"); // Get all unique months (1-12)
  let barWidth = (width - 200) / months.length;
  
  // Calculate max tonnage across all months and types to ensure consistent scaling
  //let maxTonnage = calculateMaxTonnage();
	
	let maxTonnage = 400000;
	if (!showRefuse){
		maxTonnage = 50000;
	}
	
  let niceMax = getRoundedMax(maxTonnage); // Round max for a consistent scale

  // Draw scale on the left margin, if any data type is selected
  drawScale(niceMax);

  textAlign(LEFT, CENTER);
  textFont(gotham);
  fill(125);
  textSize(16);
  text("CLICK A MONTH TO SEE TRENDS OVER TIME", width - 400, 163);

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  for (let i = 0; i < months.length; i++) {
    let monthNum = int(months[i]);
    let monthName = monthNames[monthNum - 1];
    let x = i * barWidth + 100;

    // Get tonnage values for refuse, paper, and MGP for the current month
    let refuseTons = showRefuse ? float(data.getString(i, 'REFUSETONSDAY')) : 0;
    let paperTons = showPaper ? float(data.getString(i, 'PAPERTONSDAY')) : 0;
    let mgpTons = showMGP ? float(data.getString(i, 'MGPTONSDAY')) : 0;

    // Calculate heights relative to `niceMax` to ensure consistent scale
    let refuseHeight = map(refuseTons, 0, niceMax, 0, height - 350);
    let paperHeight = map(paperTons, 0, niceMax, 0, height - 350);
    let mgpHeight = map(mgpTons, 0, niceMax, 0, height - 350);

    // Draw each section of the stack from bottom up
    let yPosition = height - 100;

    // Draw refuse section if toggle is on
    if (showRefuse) {
      fill('#794722');
      rect(x, yPosition - refuseHeight, barWidth - 10, refuseHeight);
      yPosition -= refuseHeight;
    }

    // Draw paper section if toggle is on
    if (showPaper) {
      fill('#576080');
      rect(x, yPosition - paperHeight, barWidth - 10, paperHeight);
      yPosition -= paperHeight;
    }

    // Draw MGP section if toggle is on
    if (showMGP) {
      fill('#787D80');
      rect(x, yPosition - mgpHeight, barWidth - 10, mgpHeight);
    }

    // Draw month label with letter spacing below each bar
    fill(150);
    textAlign(LEFT, CENTER);
    textFont(gotham);
    textSize(11);

    let startX = x + (barWidth - 10) / 2 - (textWidth(monthName) + 4.5 * (monthName.length - 1)) / 2;
    for (let j = 0; j < monthName.length; j++) {
      text(monthName[j], startX + j * (textWidth(monthName[j]) + 5.5), height - 85);
    }
    fill(0);
  }
}





function calculateMaxTonnage() {
  let maxTonnage = 0;

  // Iterate through each row of the data
  for (let r = 0; r < data.getRowCount(); r++) {
    let total = 0;

    // Add refuse tonnage if the toggle is on
    if (showRefuse) {
      total += float(data.getString(r, 'REFUSETONSDAY'));  // Get the refuse tonnage
    }

    // Add paper tonnage if the toggle is on
    if (showPaper) {
      total += float(data.getString(r, 'PAPERTONSDAY'));   // Get the paper tonnage
    }

    // Add MGP tonnage if the toggle is on
    if (showMGP) {
      total += float(data.getString(r, 'MGPTONSDAY'));     // Get the MGP tonnage
    }

    //Update the maximum tonnage if this row's total is greater
    maxTonnage = max(maxTonnage, total);
  }

  return maxTonnage;  // Return the highest total tonnage found
}

function drawYearlyChart() {
  background('#DADADA'); // Clear the canvas background

  // Extract relevant data for the selected month, but only for the years 1993-2024
  let dates = yearlyData.getColumn("MONTH"); // Example format: "1990-01-01"
  let paperData = [];
  let mgpData = [];
  let refuseData = [];
  let labels = [];

  for (let i = 0; i < yearlyData.getRowCount(); i++) {
    let dateParts = yearlyData.getString(i, "MONTH").split("-"); // Split to get year and month
    let year = int(dateParts[0]);
    let month = int(dateParts[1]); // Extract the month as an integer

    // Only process data for years between 1993 and 2024
    if (year >= 1994 && year <= 2023 && month === selectedMonth) {
      paperData.push(float(yearlyData.getString(i, "PAPERTONSDAY")));
      mgpData.push(float(yearlyData.getString(i, "MGPTONSDAY")));
      refuseData.push(float(yearlyData.getString(i, "REFUSETONSDAY")));
      labels.push(year); // Use the year as the label
    }
  }

  if (labels.length === 0) {
    textAlign(CENTER, CENTER);
    fill(0);
    textSize(20);
    text("No data available for the selected month.", width / 2, height / 2);
    return;
  }

  // Calculate dynamic max tonnage for scale (consider toggles)
  //let maxTonnage = 0;
  //for (let i = 0; i < paperData.length; i++) {
    //if (showPaper) maxTonnage = max(maxTonnage, paperData[i]);
    //if (showMGP) maxTonnage = max(maxTonnage, mgpData[i]);
    //if (showRefuse) maxTonnage = max(maxTonnage, refuseData[i]);
  //}

	let maxTonnage = 10000;
	if (!showRefuse){
		maxTonnage = 2000;
	}
  let niceMax = getRoundedMax(maxTonnage); // Use a rounded maximum value for the scale

  // Define bar widths and positioning
  let barWidth = (width - 200) / labels.length;
  
  for (let i = 0; i < labels.length; i++) {
    let x = i * barWidth + 100;
    let paperHeight = showPaper ? map(paperData[i], 0, niceMax, 0, height - 350) : 0;
    let mgpHeight = showMGP ? map(mgpData[i], 0, niceMax, 0, height - 350) : 0;
    let refuseHeight = showRefuse ? map(refuseData[i], 0, niceMax, 0, height - 350) : 0;
    
    // Draw bars for each type
    let yPosition = height - 100;
    
    if (showRefuse) {
      fill('#794722');
      rect(x, yPosition - refuseHeight, barWidth - 10, refuseHeight);
      yPosition -= refuseHeight;
    }

    if (showPaper) {
      fill('#576080');
      rect(x, yPosition - paperHeight, barWidth - 10, paperHeight);
      yPosition -= paperHeight;
    }

    if (showMGP) {
      fill('#787D80');
      rect(x, yPosition - mgpHeight, barWidth - 10, mgpHeight);
    }

    // Draw year label below each bar
    fill(0);
    textAlign(CENTER, CENTER);
    textFont(gotham);
    textSize(10);
    text(labels[i], x + (barWidth - 10) / 2, height - 80);
  }

  // Draw the scale on the left side of the chart
  drawScale(niceMax);
}

function updateButtonStyle(button, isActive, color) {
  if (isActive) {
    button.style('background-color', color)
      .style('color', '#ECECEC')
      .style('border', `2px solid ${color}`)
      .style('padding', '6px 12px')  // Slightly increased padding for a modest size increase
      .style('font-size', '14px');   // Slightly increased font size for a balanced look
  } else {
    button.style('background-color', 'transparent')
      .style('color', color)
      .style('border', `2px solid ${color}`)
      .style('padding', '6px 12px')  // Slightly increased padding for a modest size increase
      .style('font-size', '14px');   // Slightly increased font size for a balanced look
  }
}

// Function to get the max tonnage and round it to a visually friendly number
function getRoundedMax(targetMax) {
  // Determine the magnitude (e.g., 1K, 10K, 100K)
  const magnitude = pow(10, floor(log10(targetMax))); 
  let roundedMax = ceil(targetMax / magnitude) * magnitude;

  // Adjust to nearest multiple of 1, 2, 5, or 10 for a cleaner scale
  //if (roundedMax / magnitude <= 1.5) return 2 * magnitude;
  //if (roundedMax / magnitude <= 3) return 5 * magnitude;
  //if (roundedMax / magnitude <= 7) return 10 * magnitude;

  return roundedMax;
}

// Helper function for calculating the base-10 logarithm
function log10(x) {
  return Math.log(x) / Math.log(10);
}

function drawScale(maxValue) {
  let numTicks = 5;
  let tickInterval = maxValue / numTicks;

  textSize(10);
  textAlign(RIGHT, CENTER);
  fill(150);
	
	if (!showRefuse && !showPaper && !showMGP) {
    // Display a message if no data type is selected
    textSize(20);
    textAlign(CENTER, CENTER);
    fill(0);
    text("Toggle the buttons to see the waste data", width / 2, height / 2);
    return; // Exit the function without drawing the scale
  }

  // Draw scale labels on the left margin
  for (let i = 0; i <= numTicks; i++) {
    let y = map(i, 0, numTicks, height - 100, 350);
    let tickLabel = tickInterval * i;

    // Format label: add "K" suffix for thousands, limit to 3-4 characters
    let formattedLabel;
    if (tickLabel >= 1000) {
      formattedLabel = nf(tickLabel / 1000, 0, tickLabel < 10000 ? 1 : 0) + "K"; // e.g., 1.5K or 15K
    } else {
      formattedLabel = nf(tickLabel, 0, tickLabel < 10 ? 1 : 0); // e.g., 5 or 5.0 if below 10
    }

    textFont(gotham);
    textSize(12);
    text(formattedLabel, 80, y); // Adjusted scale label position to fit left margin
  }
}
