
resource "tls_private_key" "ssh" {
  count     = var.create_vm && local.generate_ssh ? 1 : 0
  algorithm = "ED25519"
}

resource "local_file" "ssh_private" {
  count           = var.create_vm && local.generate_ssh ? 1 : 0
  content         = tls_private_key.ssh[0].private_key_openssh
  filename        = "${path.module}/.ssh/innogram_ed25519"
  file_permission = "0600"
}

resource "local_file" "ssh_public" {
  count           = var.create_vm && local.generate_ssh ? 1 : 0
  content         = tls_private_key.ssh[0].public_key_openssh
  filename        = "${path.module}/.ssh/innogram_ed25519.pub"
  file_permission = "0644"
}
