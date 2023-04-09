# 1 "main.c"
# 1 "<built-in>"
# 1 "<command-line>"
# 1 "main.c"
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/inttypes.h" 1 3
# 37 "c:/winavr-20100110/lib/gcc/../../avr/include/inttypes.h" 3
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/stdint.h" 1 3
# 121 "c:/winavr-20100110/lib/gcc/../../avr/include/stdint.h" 3
typedef int int8_t __attribute__((__mode__(__QI__)));
typedef unsigned int uint8_t __attribute__((__mode__(__QI__)));
typedef int int16_t __attribute__ ((__mode__ (__HI__)));
typedef unsigned int uint16_t __attribute__ ((__mode__ (__HI__)));
typedef int int32_t __attribute__ ((__mode__ (__SI__)));
typedef unsigned int uint32_t __attribute__ ((__mode__ (__SI__)));

typedef int int64_t __attribute__((__mode__(__DI__)));
typedef unsigned int uint64_t __attribute__((__mode__(__DI__)));
# 142 "c:/winavr-20100110/lib/gcc/../../avr/include/stdint.h" 3
typedef int16_t intptr_t;




typedef uint16_t uintptr_t;
# 159 "c:/winavr-20100110/lib/gcc/../../avr/include/stdint.h" 3
typedef int8_t int_least8_t;




typedef uint8_t uint_least8_t;




typedef int16_t int_least16_t;




typedef uint16_t uint_least16_t;




typedef int32_t int_least32_t;




typedef uint32_t uint_least32_t;







typedef int64_t int_least64_t;






typedef uint64_t uint_least64_t;
# 213 "c:/winavr-20100110/lib/gcc/../../avr/include/stdint.h" 3
typedef int8_t int_fast8_t;




typedef uint8_t uint_fast8_t;




typedef int16_t int_fast16_t;




typedef uint16_t uint_fast16_t;




typedef int32_t int_fast32_t;




typedef uint32_t uint_fast32_t;







typedef int64_t int_fast64_t;






typedef uint64_t uint_fast64_t;
# 273 "c:/winavr-20100110/lib/gcc/../../avr/include/stdint.h" 3
typedef int64_t intmax_t;




typedef uint64_t uintmax_t;
# 38 "c:/winavr-20100110/lib/gcc/../../avr/include/inttypes.h" 2 3
# 77 "c:/winavr-20100110/lib/gcc/../../avr/include/inttypes.h" 3
typedef int32_t int_farptr_t;



typedef uint32_t uint_farptr_t;
# 2 "main.c" 2
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 1 3
# 99 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 3
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/sfr_defs.h" 1 3
# 100 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 2 3
# 330 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 3
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/iotn44.h" 1 3
# 38 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/iotn44.h" 3
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/iotnx4.h" 1 3
# 39 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/iotn44.h" 2 3
# 331 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 2 3
# 408 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 3
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/portpins.h" 1 3
# 409 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 2 3

# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/common.h" 1 3
# 411 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 2 3

# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/version.h" 1 3
# 413 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 2 3


# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/fuse.h" 1 3
# 239 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/fuse.h" 3
typedef struct
{
    unsigned char low;
    unsigned char high;
    unsigned char extended;
} __fuse_t;
# 416 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 2 3


# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/lock.h" 1 3
# 419 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 2 3
# 3 "main.c" 2
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay.h" 1 3
# 39 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay.h" 3
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 1 3
# 65 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 3
static inline void _delay_loop_1(uint8_t __count) __attribute__((always_inline));
static inline void _delay_loop_2(uint16_t __count) __attribute__((always_inline));
# 80 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 3
void
_delay_loop_1(uint8_t __count)
{
 __asm__ volatile (
  "1: dec %0" "\n\t"
  "brne 1b"
  : "=r" (__count)
  : "0" (__count)
 );
}
# 102 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay_basic.h" 3
void
_delay_loop_2(uint16_t __count)
{
 __asm__ volatile (
  "1: sbiw %0,1" "\n\t"
  "brne 1b"
  : "=w" (__count)
  : "0" (__count)
 );
}
# 40 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay.h" 2 3
# 79 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay.h" 3
static inline void _delay_us(double __us) __attribute__((always_inline));
static inline void _delay_ms(double __ms) __attribute__((always_inline));
# 109 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay.h" 3
void
_delay_ms(double __ms)
{
 uint16_t __ticks;
 double __tmp = ((1000000) / 4e3) * __ms;
 if (__tmp < 1.0)
  __ticks = 1;
 else if (__tmp > 65535)
 {

  __ticks = (uint16_t) (__ms * 10.0);
  while(__ticks)
  {

   _delay_loop_2(((1000000) / 4e3) / 10);
   __ticks --;
  }
  return;
 }
 else
  __ticks = (uint16_t)__tmp;
 _delay_loop_2(__ticks);
}
# 147 "c:/winavr-20100110/lib/gcc/../../avr/include/util/delay.h" 3
void
_delay_us(double __us)
{
 uint8_t __ticks;
 double __tmp = ((1000000) / 3e6) * __us;
 if (__tmp < 1.0)
  __ticks = 1;
 else if (__tmp > 255)
 {
  _delay_ms(__us / 1000.0);
  return;
 }
 else
  __ticks = (uint8_t)__tmp;
 _delay_loop_1(__ticks);
}
# 4 "main.c" 2
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/interrupt.h" 1 3
# 5 "main.c" 2
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/wdt.h" 1 3
# 6 "main.c" 2
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/sleep.h" 1 3
# 7 "main.c" 2
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/eeprom.h" 1 3
# 410 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/eeprom.h" 3
# 1 "c:\\winavr-20100110\\bin\\../lib/gcc/avr/4.3.3/include/stddef.h" 1 3 4
# 152 "c:\\winavr-20100110\\bin\\../lib/gcc/avr/4.3.3/include/stddef.h" 3 4
typedef int ptrdiff_t;
# 214 "c:\\winavr-20100110\\bin\\../lib/gcc/avr/4.3.3/include/stddef.h" 3 4
typedef unsigned int size_t;
# 326 "c:\\winavr-20100110\\bin\\../lib/gcc/avr/4.3.3/include/stddef.h" 3 4
typedef int wchar_t;
# 411 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/eeprom.h" 2 3
# 497 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/eeprom.h" 3
uint8_t __eerd_byte_tn44 (const uint8_t *__p) __attribute__((__pure__));




uint16_t __eerd_word_tn44 (const uint16_t *__p) __attribute__((__pure__));




uint32_t __eerd_dword_tn44 (const uint32_t *__p) __attribute__((__pure__));




float __eerd_float_tn44 (const float *__p) __attribute__((__pure__));





void __eerd_block_tn44 (void *__dst, const void *__src, size_t __n);





void __eewr_byte_tn44 (uint8_t *__p, uint8_t __value);




void __eewr_word_tn44 (uint16_t *__p, uint16_t __value);




void __eewr_dword_tn44 (uint32_t *__p, uint32_t __value);




void __eewr_float_tn44 (float *__p, float __value);





void __eewr_block_tn44 (const void *__src, void *__dst, size_t __n);





void __eeupd_byte_tn44 (uint8_t *__p, uint8_t __value);




void __eeupd_word_tn44 (uint16_t *__p, uint16_t __value);




void __eeupd_dword_tn44 (uint32_t *__p, uint32_t __value);




void __eeupd_float_tn44 (float *__p, float __value);





void __eeupd_block_tn44 (const void *__src, void *__dst, size_t __n);
# 8 "main.c" 2
# 1 "usiTwiSlave.h" 1
# 46 "usiTwiSlave.h"
# 1 "c:\\winavr-20100110\\bin\\../lib/gcc/avr/4.3.3/include/stdbool.h" 1 3 4
# 47 "usiTwiSlave.h" 2
# 56 "usiTwiSlave.h"
void usiTwiSlaveInit( uint8_t );
void usiTwiTransmitByte( uint8_t );
uint8_t usiTwiReceiveByte( void );
_Bool usiTwiDataInReceiveBuffer( void );
void usiTwiOnStart( void (*function) () );
void usiTwiOnStop( void (*function) () );
# 9 "main.c" 2
# 18 "main.c"
void inline ledOn()
{
    (*(volatile uint8_t *)((0x17) + 0x20)) |= (1 << (1)) | (1 << (0));
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~(1 << (0));
    (*(volatile uint8_t *)((0x18) + 0x20)) |= (1 << (1));
}

void inline ledOff()
{
    (*(volatile uint8_t *)((0x17) + 0x20)) &= ~((1 << (1)) | (1 << (0)));
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~((1 << (1)) | (1 << (0)));
}

void inline initBuzzer()
{
    (*(volatile uint8_t *)((0x30) + 0x20)) = 0;
    (*(volatile uint8_t *)((0x33) + 0x20)) = 0;

    (*(volatile uint8_t *)((0x30) + 0x20)) |= (1 << (5));
    (*(volatile uint8_t *)((0x30) + 0x20)) |= (1 << (0));
    (*(volatile uint8_t *)((0x33) + 0x20)) |= (1 << (0));
}

void inline static beep()
{
    initBuzzer();
    (*(volatile uint8_t *)((0x3C) + 0x20)) = 48;
    _delay_ms(42);
    (*(volatile uint8_t *)((0x33) + 0x20)) = 0;
    (*(volatile uint8_t *)((0x1B) + 0x20)) &= ~(1 << (7));
}

void static chirp(uint8_t times)
{
    (*(volatile uint8_t *)((0x00) + 0x20)) &= ~(1 << (2));
    while (times-- > 0)
    {
        beep();
        _delay_ms(40);
    }
    (*(volatile uint8_t *)((0x00) + 0x20)) |= (1 << (2));
}

static inline void playHappy()
{
    chirp(9);
    _delay_ms(350);
    chirp(1);
    _delay_ms(50);
    chirp(1);
}

static inline void playUnhappy()
{
    chirp(3);
}



static inline void inline setupGPIO()
{
    (*(volatile uint8_t *)((0x1B) + 0x20)) |= (1 << (0));
    (*(volatile uint8_t *)((0x1B) + 0x20)) &= ~(1 << (0));
    (*(volatile uint8_t *)((0x1B) + 0x20)) |= (1 << (2));
    (*(volatile uint8_t *)((0x1B) + 0x20)) &= ~(1 << (2));
    (*(volatile uint8_t *)((0x1B) + 0x20)) |= (1 << (3));
    (*(volatile uint8_t *)((0x1B) + 0x20)) &= ~(1 << (3));
    (*(volatile uint8_t *)((0x1A) + 0x20)) |= (1 << (7));
    (*(volatile uint8_t *)((0x1B) + 0x20)) &= ~(1 << (7));

    (*(volatile uint8_t *)((0x17) + 0x20)) |= (1 << (0));
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~(1 << (0));
    (*(volatile uint8_t *)((0x17) + 0x20)) |= (1 << (1));
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~(1 << (1));
    (*(volatile uint8_t *)((0x17) + 0x20)) |= (1 << (2));
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~(1 << (2));
}



void inline sleepWhileADC()
{
    do { (*(volatile uint8_t *)((0x35) + 0x20)) = (((*(volatile uint8_t *)((0x35) + 0x20)) & ~((1 << (3)) | (1 << (4)))) | ((1 << (3)))); } while(0);

    do { do { (*(volatile uint8_t *)((0x35) + 0x20)) |= (uint8_t)(1 << (5)); } while(0); do { __asm__ __volatile__ ( "sleep" "\n\t" :: ); } while(0); do { (*(volatile uint8_t *)((0x35) + 0x20)) &= (uint8_t)(~(1 << (5))); } while(0); } while (0);

}

void __vector_13 (void) __attribute__ ((signal,used, externally_visible)) ; void __vector_13 (void)
{

}



static inline void startExcitationSignal()
{
    (*(volatile uint8_t *)((0x36) + 0x20)) = 0;
    (*(volatile uint8_t *)((0x30) + 0x20)) = (1 << (6)) |
             (1 << (1));
    (*(volatile uint8_t *)((0x32) + 0x20)) = 254;
    (*(volatile uint8_t *)((0x33) + 0x20)) = (1 << (0));
}

void stopExcitationSignal() {
 (*(volatile uint8_t *)((0x33) + 0x20)) = 0;
 (*(volatile uint8_t *)((0x30) + 0x20)) = 0;
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~(1 << (2));
}

static inline void initADC()
{
    (*(volatile uint8_t *)((0x06) + 0x20)) |= (1 << (2));
    (*(volatile uint8_t *)((0x06) + 0x20)) |= (1 << (3));
    (*(volatile uint8_t *)((0x06) + 0x20)) |= (1 << (7));
}

static inline uint16_t getADC1()
{
    (*(volatile uint8_t *)((0x07) + 0x20)) = (1 << (0));

    (*(volatile uint8_t *)((0x06) + 0x20)) |= (1 << (6));

    sleepWhileADC();

    uint16_t result = (*(volatile uint8_t *)((0x04) + 0x20));
    result |= (*(volatile uint8_t *)((0x05) + 0x20)) << 8;

    return 1023 - result;
}

uint16_t getCapacitance() {
    (*(volatile uint8_t *)((0x00) + 0x20)) &= ~(1 << (2));
 startExcitationSignal();

    getADC1();
    _delay_ms(1000);
    uint16_t result = getADC1();

    stopExcitationSignal();
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~(1 << (2));
    (*(volatile uint8_t *)((0x00) + 0x20)) |= (1 << (2));

    return result;
}



uint16_t getADC8()
{
    (*(volatile uint8_t *)((0x07) + 0x20)) = 0b10100010;

    (*(volatile uint8_t *)((0x06) + 0x20)) |= (1 << (6));

    sleepWhileADC();

    uint16_t result = (*(volatile uint8_t *)((0x04) + 0x20));
    result |= (*(volatile uint8_t *)((0x05) + 0x20)) << 8;

    return result;
}

static inline uint16_t getTemperature()
{
    getADC8();
    return getADC8();
}



volatile uint16_t light = 0;
volatile uint16_t lightCounter = 0;
volatile uint8_t lightCycleOver = 1;

static inline stopLightMeaseurement()
{
    (*(volatile uint8_t *)((0x3B) + 0x20)) &= ~(1 << (5));
    (*(volatile uint8_t *)((0x2E) + 0x20)) = 0;
    (*(volatile uint8_t *)((0x20) + 0x20)) &= ~(1 << (0));
    (*(volatile uint8_t *)((0x0C) + 0x20)) &= ~(1 << (0));

    lightCycleOver = 1;
}

void __vector_3 (void) __attribute__ ((signal,used, externally_visible)) ; void __vector_3 (void)
{
    (*(volatile uint8_t *)((0x3B) + 0x20)) &= ~(1 << (5));
    (*(volatile uint8_t *)((0x2E) + 0x20)) = 0;
    lightCounter = (*(volatile uint16_t *)((0x2C) + 0x20));
    light = lightCounter;

    stopLightMeaseurement();
}

void __vector_8 (void) __attribute__ ((signal,used, externally_visible)) ; void __vector_8 (void)
{
    lightCounter = 65535;
    light = lightCounter;

    stopLightMeaseurement();
}

static inline uint16_t getLight()
{
    (*(volatile uint8_t *)((0x0C) + 0x20)) |= (1 << (0));

    (*(volatile uint8_t *)((0x17) + 0x20)) |= (1 << (1)) | (1 << (0));
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~(1 << (0));
    (*(volatile uint8_t *)((0x18) + 0x20)) |= (1 << (1));

    (*(volatile uint8_t *)((0x18) + 0x20)) |= (1 << (0));
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~(1 << (1));

    (*(volatile uint8_t *)((0x17) + 0x20)) &= ~(1 << (0));
    (*(volatile uint8_t *)((0x18) + 0x20)) &= ~((1 << (1)) | (1 << (0)));

    (*(volatile uint16_t *)((0x2C) + 0x20)) = 0;
    (*(volatile uint8_t *)((0x2F) + 0x20)) = 0;
    (*(volatile uint8_t *)((0x2E) + 0x20)) = (1 << (1)) | (1 << (0));

    (*(volatile uint8_t *)((0x20) + 0x20)) |= (1 << (0));
    (*(volatile uint8_t *)((0x3B) + 0x20)) |= (1 << (5));

    lightCycleOver = 0;
}

static inline uint8_t lightMeasurementInProgress()
{
    return !lightCycleOver;
}
# 270 "main.c"
static inline void loopSensorMode()
{
    startExcitationSignal();
    uint16_t currCapacitance = 0;
    uint16_t temperature = 0;

    while (1)
    {
        if (usiTwiDataInReceiveBuffer())
        {
            uint8_t usiRx = usiTwiReceiveByte();

            if (0x00 == usiRx)
            {
                currCapacitance = getCapacitance();
                usiTwiTransmitByte(currCapacitance >> 8);
                usiTwiTransmitByte(currCapacitance & 0x00FF);
            }
            else if (0x01 == usiRx)
            {
                uint8_t newAddress = usiTwiReceiveByte();
                if (newAddress >= 0 && newAddress <= 127)
                {
                    __eewr_byte_tn44((uint8_t *)0x01, newAddress);
                }
            }
            else if (0x02 == usiRx)
            {
                uint8_t newAddress = __eerd_byte_tn44((uint8_t *)0x01);
                usiTwiTransmitByte(newAddress);
            }
            else if (0x03 == usiRx)
            {
                if (!lightMeasurementInProgress())
                {
                    getLight();
                }
            }
            else if (0x04 == usiRx)
            {
                (*(volatile uint8_t *)((0x3B) + 0x20)) &= ~(1 << (5));
                (*(volatile uint8_t *)((0x2E) + 0x20)) = 0;

                usiTwiTransmitByte(light >> 8);
                usiTwiTransmitByte(light & 0x00FF);

                (*(volatile uint8_t *)((0x3B) + 0x20)) |= (1 << (5));
                (*(volatile uint8_t *)((0x2E) + 0x20)) = (1 << (1)) | (1 << (0));
            }
            else if (0x05 == usiRx)
            {
                temperature = getTemperature();
                usiTwiTransmitByte(temperature >> 8);
                usiTwiTransmitByte(temperature & 0x00FF);
            }
            else if (0x06 == usiRx)
            {
                __asm__ __volatile__ ( "in __tmp_reg__,__SREG__" "\n\t" "cli" "\n\t" "wdr" "\n\t" "out %0,%1" "\n\t" "out __SREG__,__tmp_reg__" "\n\t" "out %0,%2" : : "I" ((((uint16_t) &((*(volatile uint8_t *)((0x21) + 0x20)))) - 0x20)), "r" ((1 << (4)) | (1 << (3))), "r" ((uint8_t) ((0 & 0x08 ? (1 << (5)) : 0x00) | (1 << (3)) | (0 & 0x07)) ) : "r0" ); while (1) { };
            }
            else if (0x07 == usiRx)
            {
                usiTwiTransmitByte(0x21);
            }
            else if (0x08 == usiRx)
            {
                playHappy();
            }
            else if (0x09 == usiRx)
            {
                playUnhappy();
            }
            else if (0x0A == usiRx)
            {
                ledOn();
            }
            else if (0x0B == usiRx)
            {
                ledOff();
            }
        }
    }
}






int main(void)
{
    (*(volatile uint8_t *)((0x34) + 0x20)) = 0;
    __asm__ __volatile__ ( "in __tmp_reg__, __SREG__" "\n\t" "cli" "\n\t" "out %0, %1" "\n\t" "out %0, __zero_reg__" "\n\t" "out __SREG__,__tmp_reg__" "\n\t" : : "I" ((((uint16_t) &((*(volatile uint8_t *)((0x21) + 0x20)))) - 0x20)), "r" ((uint8_t)((1 << (4)) | (1 << (3)))) : "r0" );
    setupGPIO();
    initADC();

    uint8_t address = __eerd_byte_tn44((uint8_t *)0x01);
    if (address <= 0 || address >= 127)
    {
        address = 4;
    }
    usiTwiSlaveInit(address);

    (*(volatile uint8_t *)((0x26) + 0x20)) = (1 << (7));
    (*(volatile uint8_t *)((0x26) + 0x20)) = (1 << (1));

    __asm__ __volatile__ ("sei" ::);

    loopSensorMode();
}
