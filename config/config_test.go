package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"gopkg.in/yaml.v3"
)

func TestUnmarshalYAMLWithValidString(t *testing.T) {
	yamlData := `"tcp,127.0.0.1:8000,127.0.0.1:9000,proxy1"`
	var tunnel Tunnel

	err := yaml.Unmarshal([]byte(yamlData), &tunnel)

	assert.NoError(t, err)
	assert.Equal(t, []string{"tcp"}, tunnel.Network)
	assert.Equal(t, "127.0.0.1:8000", tunnel.Address)
	assert.Equal(t, "127.0.0.1:9000", tunnel.Target)
	assert.Equal(t, "proxy1", tunnel.Proxy)
}

func TestUnmarshalYAMLWithValidObject(t *testing.T) {
	yamlData := `
network:
  - tcp
  - udp
address: 127.0.0.1:8000
target: 127.0.0.1:9000
proxy: proxy1`
	var tunnel Tunnel

	err := yaml.Unmarshal([]byte(yamlData), &tunnel)

	assert.NoError(t, err)
	assert.Equal(t, []string{"tcp", "udp"}, tunnel.Network)
	assert.Equal(t, "127.0.0.1:8000", tunnel.Address)
	assert.Equal(t, "127.0.0.1:9000", tunnel.Target)
	assert.Equal(t, "proxy1", tunnel.Proxy)
}

func TestUnmarshalYAMLWithInvalidStringFormat(t *testing.T) {
	yamlData := `"tcp,127.0.0.1:8000,127.0.0.1:9000"`
	var tunnel Tunnel

	err := yaml.Unmarshal([]byte(yamlData), &tunnel)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid tunnel config")
}

func TestUnmarshalYAMLWithInvalidNetwork(t *testing.T) {
	yamlData := `"invalid,127.0.0.1:8000,127.0.0.1:9000,proxy1"`
	var tunnel Tunnel

	err := yaml.Unmarshal([]byte(yamlData), &tunnel)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid tunnel network")
}

func TestUnmarshalYAMLWithInvalidAddress(t *testing.T) {
	yamlData := `"tcp,invalid,127.0.0.1:9000,proxy1"`
	var tunnel Tunnel

	err := yaml.Unmarshal([]byte(yamlData), &tunnel)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid tunnel target or address")
}

func TestUnmarshalYAMLWithInvalidTarget(t *testing.T) {
	yamlData := `"tcp,127.0.0.1:8000,invalid,proxy1"`
	var tunnel Tunnel

	err := yaml.Unmarshal([]byte(yamlData), &tunnel)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "invalid tunnel target or address")
}
