import { motion } from 'framer-motion';

export function SnailLoader() {
  return (
    <div className="relative w-64 h-32 flex items-center justify-center">
      {/* Speed lines in background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 128">
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={i}
            x1="0"
            y1={20 + i * 12}
            x2="200"
            y2={20 + i * 12}
            stroke="#3C467B"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
            initial={{ x1: 256, x2: 256 }}
            animate={{ 
              x1: [-100, 256],
              x2: [0, 356]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.1
            }}
          />
        ))}
      </svg>

      {/* Snail - stationary but animated */}
      <motion.div
        className="relative"
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
          {/* Snail body base */}
          <g>
            {/* Body/foot */}
            <motion.ellipse
              cx="45"
              cy="58"
              rx={22}
              ry={7}
              fill="white"
              stroke="#3C467B"
              strokeWidth="2"
              opacity="0.9"
              initial={{ rx: 22, ry: 7}}
              animate={{
                rx: [22, 24, 22],
                ry: [7, 6, 7]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main body */}
            <path
              d="M 30 50 Q 25 45, 28 38 L 50 35 Q 55 37, 54 45 Q 53 52, 45 54 L 32 54 Q 28 52, 30 50 Z"
              fill="white"
              stroke="#3C467B"
              strokeWidth="2"
            />
            
            {/* Body texture lines */}
            <path
              d="M 35 42 Q 37 44, 35 46"
              fill="none"
              stroke="#3C467B"
              strokeWidth="1"
              opacity="0.4"
            />
            <path
              d="M 40 44 Q 42 46, 40 48"
              fill="none"
              stroke="#3C467B"
              strokeWidth="1"
              opacity="0.4"
            />
            <path
              d="M 45 44 Q 47 46, 45 48"
              fill="none"
              stroke="#3C467B"
              strokeWidth="1"
              opacity="0.4"
            />
            
            {/* Neck connecting to head */}
            <path
              d="M 28 38 Q 24 35, 22 30"
              fill="none"
              stroke="#3C467B"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 28 38 Q 24 35, 22 30"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>


          {/* Head */}
          <g>
            <circle cx="20" cy="28" r="4" fill="white" stroke="#3C467B" strokeWidth="2" />
            
            {/* Eye stalks (antennae) with bobbing animation */}
            <motion.g
              animate={{
                y: [0, -4, 0, -2, 0]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Left eye stalk */}
              <path
                d="M 20 28 Q 17 22, 15 16"
                fill="none"
                stroke="#3C467B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="15" cy="15" r="3" fill="white" stroke="#3C467B" strokeWidth="2" />
              <circle cx="15" cy="15" r="1.5" fill="#3C467B" />
              
              {/* Right eye stalk */}
              <path
                d="M 20 28 Q 23 22, 25 16"
                fill="none"
                stroke="#3C467B"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="25" cy="15" r="3" fill="white" stroke="#3C467B" strokeWidth="2" />
              <circle cx="25" cy="15" r="1.5" fill="#3C467B" />
            </motion.g>
            
            {/* Lower antennae with wiggle animation */}
            <motion.g
              animate={{
                rotate: [0, 8, 0, -8, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ originX: '20px', originY: '28px' }}
            >
              <path
                d="M 20 28 Q 16 30, 13 33"
                fill="none"
                stroke="#3C467B"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 20 28 Q 24 30, 27 33"
                fill="none"
                stroke="#3C467B"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </motion.g>
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
