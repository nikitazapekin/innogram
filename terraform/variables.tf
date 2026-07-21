variable "folder_id" {
  description = "Yandex Cloud folder ID"
  type        = string
}

variable "zone" {
  description = "Availability zone (must match existing subnet if reuse_network=true)"
  type        = string
  default     = "ru-central1-d"
}

variable "project_name" {
  description = "Name prefix for resources"
  type        = string
  default     = "innogram"
}
 

variable "reuse_network" {
  description = "Use an already existing VPC network instead of creating a new one"
  type        = bool
  default     = true
}

variable "existing_network_name" {
  description = "Name of existing network (when reuse_network=true)"
  type        = string
  default     = "innogram-dev-net"
}

variable "existing_subnet_name" {
  description = "Name of existing subnet in var.zone (when reuse_network=true)"
  type        = string
  default     = "innogram-dev-subnet"
}

variable "subnet_cidr" {
  description = "CIDR if creating a new subnet (reuse_network=false)"
  type        = string
  default     = "10.20.0.0/24"
}

variable "create_vm" {
  description = "Create a cheap preemptible VM with Docker for the full stack"
  type        = bool
  default     = true
}

variable "vm_name" {
  description = "Compute instance name"
  type        = string
  default     = "innogram-app"
}

variable "vm_cores" {
  type    = number
  default = 2
}

variable "vm_memory_gb" {
  type    = number
  default = 4
}

variable "vm_core_fraction" {
  description = "Guaranteed vCPU share % (20 = cheapest)"
  type        = number
  default     = 20
}

variable "vm_disk_gb" {
  type    = number
  default = 30
}

variable "vm_preemptible" {
  description = "Interruptible VM - much cheaper, may restart"
  type        = bool
  default     = true
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key. Empty = generate key in terraform/.ssh/"
  type        = string
  default     = ""
}
 

variable "open_ports" {
  description = "TCP ports open from the internet"
  type        = list(number)
  default     = [22, 80, 3000, 3001, 3002, 3004, 3005, 9000, 9001]
}
