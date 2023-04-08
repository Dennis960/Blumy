	.file	"main.c"
__SREG__ = 0x3f
__SP_H__ = 0x3e
__SP_L__ = 0x3d
__CCP__  = 0x34
__tmp_reg__ = 0
__zero_reg__ = 1
	.section	.text.ledOn,"ax",@progbits
.global	ledOn
	.type	ledOn, @function
ledOn:
/* prologue: function */
/* frame size = 0 */
	in r24,55-32
	ori r24,lo8(3)
	out 55-32,r24
	cbi 56-32,0
	sbi 56-32,1
/* epilogue start */
	ret
	.size	ledOn, .-ledOn
	.section	.text.ledOff,"ax",@progbits
.global	ledOff
	.type	ledOff, @function
ledOff:
/* prologue: function */
/* frame size = 0 */
	in r24,55-32
	andi r24,lo8(-4)
	out 55-32,r24
	in r24,56-32
	andi r24,lo8(-4)
	out 56-32,r24
/* epilogue start */
	ret
	.size	ledOff, .-ledOff
	.section	.text.initBuzzer,"ax",@progbits
.global	initBuzzer
	.type	initBuzzer, @function
initBuzzer:
/* prologue: function */
/* frame size = 0 */
	out 80-32,__zero_reg__
	out 83-32,__zero_reg__
	in r24,80-32
	ori r24,lo8(32)
	out 80-32,r24
	in r24,80-32
	ori r24,lo8(1)
	out 80-32,r24
	in r24,83-32
	ori r24,lo8(1)
	out 83-32,r24
/* epilogue start */
	ret
	.size	initBuzzer, .-initBuzzer
	.section	.text.chirp,"ax",@progbits
	.type	chirp, @function
chirp:
	push r14
	push r15
	push r16
	push r17
	push r28
	push r29
/* prologue: function */
/* frame size = 0 */
	mov r17,r24
	cbi 32-32,2
	ldi r16,lo8(48)
	ldi r24,lo8(10500)
	mov r14,r24
	ldi r24,hi8(10500)
	mov r15,r24
	ldi r28,lo8(10000)
	ldi r29,hi8(10000)
	rjmp .L8
.L9:
	rcall initBuzzer
	out 92-32,r16
	movw r24,r14
/* #APP */
 ;  105 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 1
	1: sbiw r24,1
	brne 1b
 ;  0 "" 2
/* #NOAPP */
	out 83-32,__zero_reg__
	cbi 59-32,7
	movw r24,r28
/* #APP */
 ;  105 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 1
	1: sbiw r24,1
	brne 1b
 ;  0 "" 2
/* #NOAPP */
	subi r17,lo8(-(-1))
.L8:
	tst r17
	brne .L9
	sbi 32-32,2
/* epilogue start */
	pop r29
	pop r28
	pop r17
	pop r16
	pop r15
	pop r14
	ret
	.size	chirp, .-chirp
	.section	.text.sleepWhileADC,"ax",@progbits
.global	sleepWhileADC
	.type	sleepWhileADC, @function
sleepWhileADC:
/* prologue: function */
/* frame size = 0 */
	in r24,85-32
	andi r24,lo8(-25)
	ori r24,lo8(8)
	out 85-32,r24
	in r24,85-32
	ori r24,lo8(32)
	out 85-32,r24
/* #APP */
 ;  102 "main.c" 1
	sleep
	
 ;  0 "" 2
/* #NOAPP */
	in r24,85-32
	andi r24,lo8(-33)
	out 85-32,r24
/* epilogue start */
	ret
	.size	sleepWhileADC, .-sleepWhileADC
	.section	.text.__vector_13,"ax",@progbits
.global	__vector_13
	.type	__vector_13, @function
__vector_13:
	push __zero_reg__
	push r0
	in r0,__SREG__
	push r0
	clr __zero_reg__
/* prologue: Signal */
/* frame size = 0 */
/* epilogue start */
	pop r0
	out __SREG__,r0
	pop r0
	pop __zero_reg__
	reti
	.size	__vector_13, .-__vector_13
	.section	.text.stopExcitationSignal,"ax",@progbits
.global	stopExcitationSignal
	.type	stopExcitationSignal, @function
stopExcitationSignal:
/* prologue: function */
/* frame size = 0 */
	out 83-32,__zero_reg__
	out 80-32,__zero_reg__
	cbi 56-32,2
/* epilogue start */
	ret
	.size	stopExcitationSignal, .-stopExcitationSignal
	.section	.text.getADC1,"ax",@progbits
	.type	getADC1, @function
getADC1:
/* prologue: function */
/* frame size = 0 */
	ldi r24,lo8(1)
	out 39-32,r24
	sbi 38-32,6
	rcall sleepWhileADC
	in r18,36-32
	ldi r19,lo8(0)
	in r20,37-32
	mov r25,r20
	ldi r24,lo8(0)
	or r24,r18
	or r25,r19
	ldi r18,lo8(1023)
	ldi r19,hi8(1023)
	sub r18,r24
	sbc r19,r25
	movw r24,r18
/* epilogue start */
	ret
	.size	getADC1, .-getADC1
	.section	.text.getCapacitance,"ax",@progbits
.global	getCapacitance
	.type	getCapacitance, @function
getCapacitance:
/* prologue: function */
/* frame size = 0 */
	cbi 32-32,2
	out 86-32,__zero_reg__
	ldi r24,lo8(66)
	out 80-32,r24
	ldi r24,lo8(-2)
	out 82-32,r24
	ldi r24,lo8(1)
	out 83-32,r24
	rcall getADC1
	ldi r24,lo8(10000)
	ldi r25,hi8(10000)
	ldi r18,lo8(25)
	ldi r19,hi8(25)
.L20:
	movw r30,r18
/* #APP */
 ;  105 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 1
	1: sbiw r30,1
	brne 1b
 ;  0 "" 2
/* #NOAPP */
	sbiw r24,1
	brne .L20
	rcall getADC1
	out 83-32,__zero_reg__
	out 80-32,__zero_reg__
	cbi 56-32,2
	cbi 56-32,2
	sbi 32-32,2
/* epilogue start */
	ret
	.size	getCapacitance, .-getCapacitance
	.section	.text.getADC8,"ax",@progbits
.global	getADC8
	.type	getADC8, @function
getADC8:
/* prologue: function */
/* frame size = 0 */
	ldi r24,lo8(-94)
	out 39-32,r24
	sbi 38-32,6
	rcall sleepWhileADC
	in r18,36-32
	ldi r19,lo8(0)
	in r20,37-32
	mov r25,r20
	ldi r24,lo8(0)
	or r18,r24
	or r19,r25
	movw r24,r18
/* epilogue start */
	ret
	.size	getADC8, .-getADC8
	.section	.text.__vector_3,"ax",@progbits
.global	__vector_3
	.type	__vector_3, @function
__vector_3:
	push __zero_reg__
	push r0
	in r0,__SREG__
	push r0
	clr __zero_reg__
	push r24
	push r25
/* prologue: Signal */
/* frame size = 0 */
	in r24,91-32
	andi r24,lo8(-33)
	out 91-32,r24
	out 78-32,__zero_reg__
	in r24,76-32
	in r25,(76)+1-32
	sts (lightCounter)+1,r25
	sts lightCounter,r24
	lds r24,lightCounter
	lds r25,(lightCounter)+1
	sts (light)+1,r25
	sts light,r24
	in r24,91-32
	andi r24,lo8(-33)
	out 91-32,r24
	out 78-32,__zero_reg__
	in r24,64-32
	andi r24,lo8(-2)
	out 64-32,r24
	cbi 44-32,0
	ldi r24,lo8(1)
	sts lightCycleOver,r24
/* epilogue start */
	pop r25
	pop r24
	pop r0
	out __SREG__,r0
	pop r0
	pop __zero_reg__
	reti
	.size	__vector_3, .-__vector_3
	.section	.text.__vector_8,"ax",@progbits
.global	__vector_8
	.type	__vector_8, @function
__vector_8:
	push __zero_reg__
	push r0
	in r0,__SREG__
	push r0
	clr __zero_reg__
	push r24
	push r25
/* prologue: Signal */
/* frame size = 0 */
	ldi r24,lo8(-1)
	ldi r25,hi8(-1)
	sts (lightCounter)+1,r25
	sts lightCounter,r24
	lds r24,lightCounter
	lds r25,(lightCounter)+1
	sts (light)+1,r25
	sts light,r24
	in r24,91-32
	andi r24,lo8(-33)
	out 91-32,r24
	out 78-32,__zero_reg__
	in r24,64-32
	andi r24,lo8(-2)
	out 64-32,r24
	cbi 44-32,0
	ldi r24,lo8(1)
	sts lightCycleOver,r24
/* epilogue start */
	pop r25
	pop r24
	pop r0
	out __SREG__,r0
	pop r0
	pop __zero_reg__
	reti
	.size	__vector_8, .-__vector_8
	.section	.text.main,"ax",@progbits
.global	main
	.type	main, @function
main:
	push r14
	push r15
	push r17
	push r28
	push r29
/* prologue: function */
/* frame size = 0 */
	out 84-32,__zero_reg__
	ldi r24,lo8(24)
/* #APP */
 ;  361 "main.c" 1
	in __tmp_reg__, __SREG__
	cli
	out 33, r24
	out 33, __zero_reg__
	out __SREG__,__tmp_reg__
	
 ;  0 "" 2
/* #NOAPP */
	sbi 59-32,0
	cbi 59-32,0
	sbi 59-32,2
	cbi 59-32,2
	sbi 59-32,3
	cbi 59-32,3
	sbi 58-32,7
	cbi 59-32,7
	sbi 55-32,0
	cbi 56-32,0
	sbi 55-32,1
	cbi 56-32,1
	sbi 55-32,2
	cbi 56-32,2
	sbi 38-32,2
	sbi 38-32,3
	sbi 38-32,7
	ldi r24,lo8(1)
	ldi r25,hi8(1)
	rcall __eerd_byte_tn44
	sbrc r24,7
	ldi r24,lo8(127)
.L30:
	rcall usiTwiSlaveInit
	ldi r24,lo8(-128)
	out 70-32,r24
	ldi r24,lo8(2)
	out 70-32,r24
/* #APP */
 ;  375 "main.c" 1
	sei
 ;  0 "" 2
/* #NOAPP */
	out 86-32,__zero_reg__
	ldi r24,lo8(66)
	out 80-32,r24
	ldi r24,lo8(-2)
	out 82-32,r24
	ldi r24,lo8(1)
	out 83-32,r24
	ldi r25,lo8(25)
	mov r14,r25
	mov r15,__zero_reg__
	ldi r28,lo8(12500)
	ldi r29,hi8(12500)
.L49:
	rcall usiTwiDataInReceiveBuffer
	tst r24
	breq .L49
	rcall usiTwiReceiveByte
	mov r25,r24
	tst r24
	brne .L32
	rcall getCapacitance
	rjmp .L52
.L32:
	cpi r24,lo8(1)
	brne .L33
	rcall usiTwiReceiveByte
	mov r22,r24
	sbrc r24,7
	rjmp .L49
	ldi r24,lo8(1)
	ldi r25,hi8(1)
	rcall __eewr_byte_tn44
	rjmp .L49
.L33:
	cpi r24,lo8(2)
	brne .L34
	ldi r24,lo8(1)
	ldi r25,hi8(1)
	rcall __eerd_byte_tn44
.L50:
	rcall usiTwiTransmitByte
	rjmp .L49
.L34:
	cpi r24,lo8(3)
	brne .L35
	lds r24,lightCycleOver
	tst r24
	breq .L49
	sbi 44-32,0
	in r24,55-32
	ori r24,lo8(3)
	out 55-32,r24
	cbi 56-32,0
	sbi 56-32,1
	sbi 56-32,0
	cbi 56-32,1
	cbi 55-32,0
	in r24,56-32
	andi r24,lo8(-4)
	out 56-32,r24
	out (76)+1-32,__zero_reg__
	out 76-32,__zero_reg__
	out 79-32,__zero_reg__
	out 78-32,r25
	in r24,64-32
	ori r24,lo8(1)
	out 64-32,r24
	in r24,91-32
	ori r24,lo8(32)
	out 91-32,r24
	sts lightCycleOver,__zero_reg__
	rjmp .L49
.L35:
	cpi r24,lo8(4)
	brne .L36
	in r24,91-32
	andi r24,lo8(-33)
	out 91-32,r24
	out 78-32,__zero_reg__
	lds r24,light
	lds r25,(light)+1
	mov r24,r25
	rcall usiTwiTransmitByte
	lds r24,light
	lds r25,(light)+1
	rcall usiTwiTransmitByte
	in r24,91-32
	ori r24,lo8(32)
	out 91-32,r24
	ldi r24,lo8(3)
	out 78-32,r24
	rjmp .L49
.L36:
	cpi r24,lo8(5)
	brne .L37
	rcall getADC8
	rcall getADC8
.L52:
	mov r17,r24
	mov r24,r25
	rcall usiTwiTransmitByte
	mov r24,r17
	rjmp .L50
.L37:
	cpi r24,lo8(6)
	brne .L38
	ldi r18,lo8(8)
	ldi r24,lo8(24)
	ldi r25,hi8(24)
/* #APP */
 ;  327 "main.c" 1
	in __tmp_reg__,__SREG__
	cli
	wdr
	out 33,r24
	out __SREG__,__tmp_reg__
	out 33,r18
 ;  0 "" 2
/* #NOAPP */
.L39:
	rjmp .L39
.L38:
	cpi r24,lo8(7)
	brne .L40
	ldi r24,lo8(33)
	rjmp .L50
.L40:
	cpi r24,lo8(8)
	brne .L41
	ldi r24,lo8(9)
	rcall chirp
	ldi r24,lo8(3500)
	ldi r25,hi8(3500)
.L42:
	movw r30,r14
/* #APP */
 ;  105 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 1
	1: sbiw r30,1
	brne 1b
 ;  0 "" 2
/* #NOAPP */
	sbiw r24,1
	brne .L42
	ldi r24,lo8(1)
	rcall chirp
	movw r24,r28
/* #APP */
 ;  105 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 1
	1: sbiw r24,1
	brne 1b
 ;  0 "" 2
/* #NOAPP */
	ldi r24,lo8(1)
	rjmp .L51
.L41:
	cpi r24,lo8(9)
	brne .L43
	ldi r24,lo8(3)
.L51:
	rcall chirp
	rjmp .L49
.L43:
	cpi r24,lo8(10)
	brne .L44
	rcall ledOn
	rjmp .L49
.L44:
	cpi r24,lo8(11)
	breq .+2
	rjmp .L49
	in r24,55-32
	andi r24,lo8(-4)
	out 55-32,r24
	in r24,56-32
	andi r24,lo8(-4)
	out 56-32,r24
	rjmp .L49
	.size	main, .-main
.global	light
	.section	.bss.light,"aw",@nobits
	.type	light, @object
	.size	light, 2
light:
	.skip 2,0
.global	lightCounter
	.section	.bss.lightCounter,"aw",@nobits
	.type	lightCounter, @object
	.size	lightCounter, 2
lightCounter:
	.skip 2,0
.global	lightCycleOver
	.section	.data.lightCycleOver,"aw",@progbits
	.type	lightCycleOver, @object
	.size	lightCycleOver, 1
lightCycleOver:
	.byte	1
.global __do_copy_data
.global __do_clear_bss
