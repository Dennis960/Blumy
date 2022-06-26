# 1 "usiTwiSlave.c"
# 1 "<built-in>"
# 1 "<command-line>"
# 1 "usiTwiSlave.c"
# 45 "usiTwiSlave.c"
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 1 3
# 99 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/io.h" 3
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/sfr_defs.h" 1 3
# 126 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/sfr_defs.h" 3
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
# 127 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/sfr_defs.h" 2 3
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
# 46 "usiTwiSlave.c" 2
# 1 "c:/winavr-20100110/lib/gcc/../../avr/include/avr/interrupt.h" 1 3
# 47 "usiTwiSlave.c" 2
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
# 48 "usiTwiSlave.c" 2
# 249 "usiTwiSlave.c"
typedef enum
{
  USI_SLAVE_CHECK_ADDRESS = 0x00,
  USI_SLAVE_SEND_DATA = 0x01,
  USI_SLAVE_REQUEST_REPLY_FROM_SEND_DATA = 0x02,
  USI_SLAVE_CHECK_REPLY_FROM_SEND_DATA = 0x03,
  USI_SLAVE_REQUEST_DATA = 0x04,
  USI_SLAVE_GET_DATA_AND_SEND_ACK = 0x05
} overflowState_t;
# 267 "usiTwiSlave.c"
static uint8_t slaveAddress;
static volatile overflowState_t overflowState;
static volatile uint8_t inPacket;


static uint8_t rxBuf[ ( 16 ) ];
static volatile uint8_t rxHead;
static volatile uint8_t rxTail;

static uint8_t txBuf[ ( 16 ) ];
static volatile uint8_t txHead;
static volatile uint8_t txTail;

static void (*usiTwiOnStartFunction) ();
static void (*usiTwiOnStopFunction) ();
# 295 "usiTwiSlave.c"
static
void
flushTwiBuffers(
  void
)
{
  rxTail = 0;
  rxHead = 0;
  txTail = 0;
  txHead = 0;
}
# 319 "usiTwiSlave.c"
void
usiTwiSlaveInit(
  uint8_t ownAddress
)
{
  flushTwiBuffers( );

  slaveAddress = ownAddress;
  inPacket = 0;







  (*(volatile uint8_t *)((0x1A) + 0x20)) |= ( 1 << 4 ) | ( 1 << 6 );


  (*(volatile uint8_t *)((0x1B) + 0x20)) |= ( 1 << 4 );


  (*(volatile uint8_t *)((0x1B) + 0x20)) |= ( 1 << 6 );


  (*(volatile uint8_t *)((0x1A) + 0x20)) &= ~( 1 << 6 );

  (*(volatile uint8_t *)((0x0D) + 0x20)) =

       ( 1 << 7 ) |

       ( 0 << 6 ) |

       ( 1 << 5 ) | ( 0 << 4 ) |


       ( 1 << 3 ) | ( 0 << 2 ) | ( 0 << 1 ) |

       ( 0 << 0 );



  (*(volatile uint8_t *)((0x0E) + 0x20)) = ( 1 << 7 ) | ( 1 << 6 ) | ( 1 << 5 ) | ( 1 << 4 );

}





void
usiTwiTransmitByte(
  uint8_t data
)
{

  uint8_t tmphead;


  tmphead = ( txHead + 1 ) & ( ( 16 ) - 1 );


  while ( tmphead == txTail );


  txBuf[ tmphead ] = data;


  txHead = tmphead;

}





uint8_t
usiTwiReceiveByte(
  void
)
{


  while ( rxHead == rxTail );


  rxTail = ( rxTail + 1 ) & ( ( 16 ) - 1 );


  return rxBuf[ rxTail ];

}





_Bool
usiTwiDataInReceiveBuffer(
  void
)
{


  return rxHead != rxTail;

}




void
usiTwiOnStart(
  void (*function) ()
)
{
  usiTwiOnStartFunction = function;
}




void
usiTwiOnStop(
  void (*function) ()
)
{
  usiTwiOnStopFunction = function;
}
# 457 "usiTwiSlave.c"
void __vector_15 (void) __attribute__ ((signal,used, externally_visible)) ; void __vector_15 (void)
{


  overflowState = USI_SLAVE_CHECK_ADDRESS;


  (*(volatile uint8_t *)((0x1A) + 0x20)) &= ~( 1 << 6 );






  while (

       ( (*(volatile uint8_t *)((0x19) + 0x20)) & ( 1 << 4 ) ) &&

       !( ( (*(volatile uint8_t *)((0x19) + 0x20)) & ( 1 << 6 ) ) )
  );

  if ( !(((*(volatile uint8_t *)((0x19) + 0x20)) & (1<<6)) && ((*(volatile uint8_t *)((0x19) + 0x20)) & (1<<4))))
  {



    (*(volatile uint8_t *)((0x0D) + 0x20)) =

         ( 1 << 7 ) |

         ( 1 << 6 ) |

         ( 1 << 5 ) | ( 1 << 4 ) |


         ( 1 << 3 ) | ( 0 << 2 ) | ( 0 << 1 ) |

         ( 0 << 0 );

  }
  else
  {


    (*(volatile uint8_t *)((0x0D) + 0x20)) =

         ( 1 << 7 ) |

         ( 0 << 6 ) |

         ( 1 << 5 ) | ( 0 << 4 ) |


         ( 1 << 3 ) | ( 0 << 2 ) | ( 0 << 1 ) |

         ( 0 << 0 );

  }

  (*(volatile uint8_t *)((0x0E) + 0x20)) =


       ( 1 << 7 ) | ( 1 << 6 ) |
       ( 1 << 5 ) |( 1 << 4 ) |

       ( 0x0 << 0);

}
# 538 "usiTwiSlave.c"
void __vector_16 (void) __attribute__ ((signal,used, externally_visible)) ; void __vector_16 (void)
{

  switch ( overflowState )
  {



    case USI_SLAVE_CHECK_ADDRESS:
      if ( ( (*(volatile uint8_t *)((0x0F) + 0x20)) == 0 ) || ( ( (*(volatile uint8_t *)((0x0F) + 0x20)) >> 1 ) == slaveAddress) )
      {
        if (usiTwiOnStartFunction != 0) usiTwiOnStartFunction();

        if ( (*(volatile uint8_t *)((0x0F) + 0x20)) & 0x01 )
        {
          overflowState = USI_SLAVE_SEND_DATA;
        }
        else
        {
          overflowState = USI_SLAVE_REQUEST_DATA;
        }
        { (*(volatile uint8_t *)((0x0F) + 0x20)) = 0; (*(volatile uint8_t *)((0x1A) + 0x20)) |= ( 1 << 6 ); (*(volatile uint8_t *)((0x0E) + 0x20)) = ( 0 << 7 ) | ( 1 << 6 ) | ( 1 << 5 ) | ( 1 << 4 )| ( 0x0E << 0 ); };
      }
      else
      {
        { (*(volatile uint8_t *)((0x0D) + 0x20)) = ( 1 << 7 ) | ( 0 << 6 ) | ( 1 << 5 ) | ( 0 << 4 ) | ( 1 << 3 ) | ( 0 << 2 ) | ( 0 << 1 ) | ( 0 << 0 ); (*(volatile uint8_t *)((0x0E) + 0x20)) = ( 0 << 7 ) | ( 1 << 6 ) | ( 1 << 5 ) | ( 1 << 4 ) | ( 0x0 << 0 ); };
      }
      break;



    case USI_SLAVE_CHECK_REPLY_FROM_SEND_DATA:
      if ( (*(volatile uint8_t *)((0x0F) + 0x20)) )
      {

        { (*(volatile uint8_t *)((0x0D) + 0x20)) = ( 1 << 7 ) | ( 0 << 6 ) | ( 1 << 5 ) | ( 0 << 4 ) | ( 1 << 3 ) | ( 0 << 2 ) | ( 0 << 1 ) | ( 0 << 0 ); (*(volatile uint8_t *)((0x0E) + 0x20)) = ( 0 << 7 ) | ( 1 << 6 ) | ( 1 << 5 ) | ( 1 << 4 ) | ( 0x0 << 0 ); };
        return;
      }





    case USI_SLAVE_SEND_DATA:

      if ( txHead != txTail )
      {
        txTail = ( txTail + 1 ) & ( ( 16 ) - 1 );
        (*(volatile uint8_t *)((0x0F) + 0x20)) = txBuf[ txTail ];
      }
      else
      {

       (*(volatile uint8_t *)((0x0F) + 0x20)) = 255;


      }
      overflowState = USI_SLAVE_REQUEST_REPLY_FROM_SEND_DATA;
      { (*(volatile uint8_t *)((0x1A) + 0x20)) |= ( 1 << 6 ); (*(volatile uint8_t *)((0x0E) + 0x20)) = ( 0 << 7 ) | ( 1 << 6 ) | ( 1 << 5 ) | ( 1 << 4) | ( 0x0 << 0 ); };
      break;



    case USI_SLAVE_REQUEST_REPLY_FROM_SEND_DATA:
      overflowState = USI_SLAVE_CHECK_REPLY_FROM_SEND_DATA;
      { (*(volatile uint8_t *)((0x1A) + 0x20)) &= ~( 1 << 6 ); (*(volatile uint8_t *)((0x0F) + 0x20)) = 0; (*(volatile uint8_t *)((0x0E) + 0x20)) = ( 0 << 7 ) | ( 1 << 6 ) | ( 1 << 5 ) | ( 1 << 4 ) | ( 0x0E << 0 ); };
      break;



    case USI_SLAVE_REQUEST_DATA:
      overflowState = USI_SLAVE_GET_DATA_AND_SEND_ACK;
      { (*(volatile uint8_t *)((0x1A) + 0x20)) &= ~( 1 << 6 ); (*(volatile uint8_t *)((0x0E) + 0x20)) = ( 0 << 7 ) | ( 1 << 6 ) | ( 1 << 5 ) | ( 1 << 4 ) | ( 0x0 << 0 ); };
      break;



    case USI_SLAVE_GET_DATA_AND_SEND_ACK:


      rxHead = ( rxHead + 1 ) & ( ( 16 ) - 1 );
      rxBuf[ rxHead ] = (*(volatile uint8_t *)((0x0F) + 0x20));

      overflowState = USI_SLAVE_REQUEST_DATA;
      { (*(volatile uint8_t *)((0x0F) + 0x20)) = 0; (*(volatile uint8_t *)((0x1A) + 0x20)) |= ( 1 << 6 ); (*(volatile uint8_t *)((0x0E) + 0x20)) = ( 0 << 7 ) | ( 1 << 6 ) | ( 1 << 5 ) | ( 1 << 4 )| ( 0x0E << 0 ); };
      break;

  }

}
