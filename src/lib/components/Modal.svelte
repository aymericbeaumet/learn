<div>
	<slot />
</div>

<style>
	div {
		position: fixed;
		background-color: rgba(1, 1, 1, 0.5);
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100vh;

		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
