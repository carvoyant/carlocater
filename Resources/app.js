/*
* Single Window Application Template:
* A basic starting point for your application.  Mostly a blank canvas.
*
* In app.js, we generally take care of a few things:
* - Bootstrap the application with any data we need
* - Check for dependencies like device type, platform version or network connection
* - Require and open our top-level UI component
*
*/

//bootstrap and check dependencies
if (Ti.version < 1.8) {
	alert(L('sorry_app_req') + ' Titanium Mobile SDK 1.8 '+ L('or_later'));
}



// set units based on locale (America and Burma use Imperial)
if (Ti.Locale.currentLocale == "en-US" || Ti.Locale.currentLocale == "my-MM") {
	Ti.App.Properties.setString("unitSystem", "Imperial");
}

// the rest of the world uses Metric
else {
	Ti.App.Properties.setString("unitSystem", "Metric");
}
	
var moment = require('lib/moment');

Ti.Geolocation.purpose = L('app_purpose');
if (Ti.Platform.osname == 'iphone')
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST_FOR_NAVIGATION;
else {
	Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_HIGH;
	Ti.Gesture.addEventListener('orientationchange', function(e) {
		Ti.Android.currentActivity.setRequestedOrientation(Ti.Android.SCREEN_ORIENTATION_PORTRAIT);
	});
}

var loginWindow = Ti.UI.createWindow();
var loggedIn = false;
var carvoyantConnect = require('lib/CarvoyantConnect');

// This is a single context application with multiple windows in a stack
(function() {

	var osname = Ti.Platform.osname;

	if (!Ti.App.Properties.hasProperty("unitSystem")) Ti.App.Properties.setString("unitSystem", "Imperial");

	// Android usecurrentActivitys platform-specific properties to create windows.
	// All other platforms follow a similar UI pattern.
	if (osname === 'android') {
			
			if(!(Ti.App.Properties.hasProperty("Username") && Ti.App.Properties.hasProperty("Password")))
			{

				var forms = require('ui/common/forms');
				
				var fields = [
					{ title: "loginLogo", type:'image', id:'/images/loginLogo.png' },
					{ title: L('username'), type:'text', id:'name' },
					{ title: L('password'), type:'password', id:'password' },
					{ title: L('remember_me'), type:'switch', id:'remember' },
					{ title: L('login'), type:'submit', id:'login' },
					{ title: L('register'), type:'link', id:'register' }
				];
				
				var form = forms.createForm({
					style: forms.STYLE_LABEL,
					fields: fields
				});
				
				form.addEventListener('login', function(e) {
					if(e.values.remember)
						Ti.App.remember = true;
	
					
					Ti.App.Username = e.values.name;
					Ti.App.Password = e.values.password;

					var carvoyantConnect = require('lib/CarvoyantConnect');
					carvoyantConnect.getVehicles();
				});
				
				form.addEventListener('register', function(e) {
					Titanium.Platform.openURL('http://dash.carvoyant.com/register');
				});
				loginWindow.add(form);
				
				loginWindow.open();
				
			}
			else
			{
				Ti.App.Username = Ti.App.Properties.getString('Username');
				Ti.App.Password = Ti.App.Properties.getString('Password');				

				carvoyantConnect.getVehicles();
			}

	} 
	else {
		
		var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
		new ApplicationTabGroup().open();
	}
	
})();
		
		var Window;
		var appWindow;
Ti.App.addEventListener('app:dataLoaded', function(e){
	
	if(!loggedIn)
	{
		loggedIn = true;
		
		loginWindow.close();
	
		Window = require('ui/handheld/android/ApplicationWindow');
		appWindow = new Window(); 
		appWindow.open();
		if(!Ti.App.Properties.hasProperty("mapType"))	
		{
			Ti.App.Properties.setBool('mapType', false);
		}
		Ti.App.addEventListener('satClick', function(data){
			if(data.hasCheck)				
				appWindow.mapView.setMapType(Titanium.Map.SATELLITE_TYPE);
			else
				appWindow.mapView.setMapType(Titanium.Map.STANDARD_TYPE);
		});
	}
	else{
		Ti.API.info("refresh")
		appWindow.mapView.removeAllAnnotations();
		appWindow.Map.resetPin_Map(appWindow.mapView, Ti.App.Properties.getObject("defaultVehicle"));
		appWindow.settings.close();
	}
});

Ti.App.addEventListener('refresh', function(e)
{
	carvoyantConnect.getVehicles();	
});
