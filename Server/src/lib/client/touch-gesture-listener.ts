export type SwipeEventDetail = {
	direction: 'swipeleft' | 'swiperight';
	distance: number;
	duration: number;
	speed: number;
	startX: number;
	endX: number;
};

export type SwipeStartEventDetail = {
	direction: 'swipeleftstart' | 'swiperightstart';
	startX: number;
	startY: number;
};

export class SwipeListener {
	target: EventTarget;
	MIN_SWIPE_DISTANCE: number;
	MAX_SWIPE_TIME: number;
	MIN_SWIPE_SPEED: number;
	MAX_VERTICAL_OFFSET: number;
	DIRECTION_GUESS_THRESHOLD: number;
	touchStartX: number;
	touchStartY: number;
	touchStartTime: number;
	directionGuessed: boolean;
	eventHandlers: {
		swipeleft: ((event: CustomEvent) => void)[];
		swiperight: ((event: CustomEvent) => void)[];
		swipeleftstart: ((event: CustomEvent) => void)[];
		swiperightstart: ((event: CustomEvent) => void)[];
	};

	constructor(target = document) {
		this.target = target;
		this.MIN_SWIPE_DISTANCE = 50;
		this.MAX_SWIPE_TIME = 500;
		this.MIN_SWIPE_SPEED = 0.3;
		this.MAX_VERTICAL_OFFSET = 75;
		this.DIRECTION_GUESS_THRESHOLD = 10;

		this.touchStartX = 0;
		this.touchStartY = 0;
		this.touchStartTime = 0;
		this.directionGuessed = false;

		this.eventHandlers = {
			swipeleft: [],
			swiperight: [],
			swipeleftstart: [],
			swiperightstart: []
		};

		this._handleTouchStart = this._handleTouchStart.bind(this);
		this._handleTouchEnd = this._handleTouchEnd.bind(this);
		this._handleTouchMove = this._handleTouchMove.bind(this);

		this.target.addEventListener('touchstart', this._handleTouchStart, { passive: true });
		this.target.addEventListener('touchend', this._handleTouchEnd, { passive: true });
		this.target.addEventListener('touchmove', this._handleTouchMove, { passive: true });
	}

	_handleTouchStart(e: Event) {
		const touchEvent = e as TouchEvent;
		if (touchEvent.touches.length > 1) return;
		const touch = touchEvent.touches[0];
		this.touchStartX = touch.clientX;
		this.touchStartY = touch.clientY;
		this.touchStartTime = Date.now();
		this.directionGuessed = false;
	}

	_handleTouchMove(e: Event) {
		if (this.directionGuessed) return;
		const touchEvent = e as TouchEvent;
		if (touchEvent.touches.length === 0) return;
		const touch = touchEvent.touches[0];
		const dx = touch.clientX - this.touchStartX;
		const dy = touch.clientY - this.touchStartY;

		if (
			Math.abs(dx) >= this.DIRECTION_GUESS_THRESHOLD &&
			Math.abs(dy) <= this.MAX_VERTICAL_OFFSET
		) {
			const direction = dx > 0 ? 'swiperightstart' : 'swipeleftstart';
			this._dispatchSwipeStartEvent(direction, {
				direction,
				startX: this.touchStartX,
				startY: this.touchStartY
			});
			this.directionGuessed = true;
		}
	}

	_handleTouchEnd(e: Event) {
		const touchEvent = e as TouchEvent;
		if (touchEvent.changedTouches.length === 0) return;
		const touch = touchEvent.changedTouches[0];
		const dx = touch.clientX - this.touchStartX;
		const dy = touch.clientY - this.touchStartY;
		const dt = Date.now() - this.touchStartTime;

		const absDx = Math.abs(dx);
		const absDy = Math.abs(dy);
		const speed = absDx / dt;

		const isHorizontalSwipe =
			absDx >= this.MIN_SWIPE_DISTANCE &&
			absDy <= this.MAX_VERTICAL_OFFSET &&
			dt <= this.MAX_SWIPE_TIME &&
			speed >= this.MIN_SWIPE_SPEED;

		if (isHorizontalSwipe) {
			const direction = dx > 0 ? 'swiperight' : 'swipeleft';
			this._dispatchSwipeEvent(direction, {
				direction,
				distance: absDx,
				duration: dt,
				speed,
				startX: this.touchStartX,
				endX: touch.clientX
			});
		}
	}

	_dispatchSwipeEvent(type: 'swipeleft' | 'swiperight', detail: SwipeEventDetail) {
		const event = new CustomEvent(type, { detail });
		for (const handler of this.eventHandlers[type]) {
			handler(event);
		}
	}

	_dispatchSwipeStartEvent(
		type: 'swipeleftstart' | 'swiperightstart',
		detail: SwipeStartEventDetail
	) {
		const event = new CustomEvent(type, { detail });
		for (const handler of this.eventHandlers[type]) {
			handler(event);
		}
	}

	addEventListener(
		type: 'swipeleft' | 'swiperight' | 'swipeleftstart' | 'swiperightstart',
		handler: (event: CustomEvent) => void
	) {
		if (this.eventHandlers[type]) {
			this.eventHandlers[type].push(handler);
		}
	}

	removeEventListener(
		type: 'swipeleft' | 'swiperight' | 'swipeleftstart' | 'swiperightstart',
		handler: (event: CustomEvent) => void
	) {
		if (this.eventHandlers[type]) {
			this.eventHandlers[type] = this.eventHandlers[type].filter((h) => h !== handler);
		}
	}

	destroy() {
		this.target.removeEventListener('touchstart', this._handleTouchStart);
		this.target.removeEventListener('touchend', this._handleTouchEnd);
		this.target.removeEventListener('touchmove', this._handleTouchMove);
		this.eventHandlers = {
			swipeleft: [],
			swiperight: [],
			swipeleftstart: [],
			swiperightstart: []
		};
	}
}
