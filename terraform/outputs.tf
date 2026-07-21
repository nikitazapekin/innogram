output "folder_name" {
  value = data.yandex_resourcemanager_folder.current.name
}

output "network_id" {
  value = local.network_id
}

output "subnet_id" {
  value = local.subnet_id
}

output "vm_created" {
  value = var.create_vm
}

output "vm_external_ip" {
  description = "Public IP of the app VM (null if create_vm=false)"
  value       = var.create_vm ? yandex_compute_instance.app[0].network_interface[0].nat_ip_address : null
}

output "vm_name" {
  value = var.create_vm ? yandex_compute_instance.app[0].name : null
}

output "ssh_command" {
  description = "SSH into the VM"
  value = var.create_vm ? (
    local.generate_ssh
    ? "ssh -i ${path.module}/.ssh/innogram_ed25519 ${var.ssh_username}@${yandex_compute_instance.app[0].network_interface[0].nat_ip_address}"
    : "ssh ${var.ssh_username}@${yandex_compute_instance.app[0].network_interface[0].nat_ip_address}"
  ) : null
}

output "deploy_hint" {
  value = var.create_vm ? "Wait 2-3 min for cloud-init, then run: ./scripts/deploy-compose.sh" : "create_vm=false — set create_vm=true and terraform apply"
}

output "postgres_password" {
  description = "Generated Postgres password on the VM"
  value       = var.create_vm ? random_password.postgres[0].result : null
  sensitive   = true
}

output "minio_password" {
  description = "Generated MinIO password on the VM"
  value       = var.create_vm ? random_password.minio[0].result : null
  sensitive   = true
}
