<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="csrf-token" content="{{csrf_token()}}">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<script src="//polyfill.io/v3/polyfill.min.js" type="text/javascript"></script>
	
	<link rel="shortcut icon" type="image/x-icon" href="{{asset('favicon.ico')}}">
	<link rel="icon" type="image/x-icon" href="{{asset('favicon.ico')}}"/>
	<link rel="stylesheet" href="{{mix('css/vendor.css')}}" type="text/css"/>
	
	<link rel="stylesheet" href="{{mix('css/index.css')}}" type="text/css"/>
	<link rel="stylesheet" href="{{asset('loader.css')}}" type="text/css"/>
	
	<script type="text/javascript">
		window.__APP__ = @json($data);
	</script>
	
	<title>{{config('app.name')}}</title>
</head>
<body>
	<noscript>
		You need to enable JavaScript to run this app.
	</noscript>
	
	<div id="root" class="installer-container"
	     style="background-image: url('{{asset('background.jpg')}}');">
		<div class="loader">
			<div class="content">
				<img src="{{asset('images/logo-icon.png')}}" alt="{{config('app.name')}}">
			</div>
		</div>
	</div>
	
	<script type="text/javascript" src="{{asset('vendor/pace.min.js')}}"></script>
	<script type="text/javascript" src="{{mix('js/installer/index.js')}}"></script>
</body>
</html>
