PlayerEvents.loggedIn(event => {
	const data = event.player.persistentData
	if (!data.getBoolean("firstJoin")) {
		data.putBoolean("firstJoin", true)
		event.player.give("1x numismatics:sun")
	}
});
