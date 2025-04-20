"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Text } from "@react-three/drei"
import type * as THREE from "three"

interface Building3DProps {
  position: [number, number, number]
  icon: string
}

export default function Building3D({ position, icon }: Building3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group position={position}>
      <Box args={[1, 2, 1]} ref={meshRef}>
        <meshStandardMaterial color="lightgray" />
      </Box>
      <Text position={[0, 1.5, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {icon}
      </Text>
    </group>
  )
}
