locals {
  labels = {
    project     = var.project_name
    managed_by  = "terraform"
    environment = "dev"
    app         = "innogram"
  }

  network_id = var.reuse_network ? data.yandex_vpc_network.existing[0].id : yandex_vpc_network.this[0].id
  subnet_id  = var.reuse_network ? data.yandex_vpc_subnet.existing[0].id : yandex_vpc_subnet.this[0].id

 
  generate_ssh = var.ssh_public_key_path == ""
  ssh_public_key = !var.create_vm ? "" : (
    local.generate_ssh
    ? trimspace(tls_private_key.ssh[0].public_key_openssh)
    : trimspace(file(pathexpand(var.ssh_public_key_path)))
  )
  ssh_private_key_path = local.generate_ssh ? "${path.module}/.ssh/innogram_ed25519" : ""
}
